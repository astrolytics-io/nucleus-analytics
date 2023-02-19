import { getStore, getWsClient, isDevMode, debounce } from "./utils.js"

import { detectData, detectSessionId, defaultProps } from "./detectData.js"

import throttledQueue from "throttled-queue"
import { nanoid } from "nanoid"

const throttle = throttledQueue(20, 1000) // at most 20 requests per second.
const WebSocket = getWsClient()
const store = getStore()

// Options that can be changed by the user
let endpoint = "wss://app.nucleus.sh"
let useInDev = true
let debug = false
let trackingOff = false
let reportInterval = 20
let sessionTimeout = 30 * 60 // 1 hour

// Variables we'll need later globally
let ws = null
let localData = {}
let initted = false
let active = true
let lastActive = new Date().getTime()

const stored = {
  queue: store.get("nucleus-queue") || [],
  props: store.get("nucleus-props") || {},
  userId: store.get("nucleus-userId") || null,
  anonId: store.get("nucleus-anonId") || null,
}

const completeEvents = (events) => {
  return events.map((event) => {
    const { type } = event
    const { deviceId } = localData
    const { userId, anonId } = stored

    let newEvent = {
      ...event,
      userId,
      anonId,
      deviceId,
    }

    // So we don't send unnecessary data when not needed
    // (= first event, and on error)
    if (type && ["init", "error"].includes(type)) {
      const { platform, osVersion, version, locale, moduleVersion } = localData

      const extra = {
        client: "js",
        platform,
        osVersion,
        version,
        locale,
        moduleVersion,
      }

      newEvent = { ...newEvent, ...extra }
    }

    // remove null and undefined values
    Object.keys(newEvent).forEach((key) => {
      if (newEvent[key] === null || newEvent[key] === undefined) {
        delete newEvent[key]
      }
    })

    return newEvent
  })
}

// keep track of user inactivity via its interactions with the window, and kill the session in case of inactivity
const monitorUserInactivity = () => {
  const resetActiveTimer = () => {
    lastActive = new Date().getTime()

    if (!active) {
      // the user is active again after expired session, so we need to call init again with a new session id
      log("user became active again, reinitializing")
      active = true
      localData = { ...localData, ...detectSessionId() }
      Nucleus.track(null, null, "init")
    }
  }

  for (let event of ["mousedown", "keydown", "touchstart", "scroll"]) {
    document.addEventListener(event, resetActiveTimer)
  }

  // time-based setInterval instead of setTimeout as browser can slow down internal timer if tab in background
  setInterval(() => {
    if (!active) return
    const inactivityDuration = new Date().getTime() - lastActive
    if (inactivityDuration > sessionTimeout * 1000) {
      log("user inactivity timeout")
      active = false
      window.sessionStorage.clear() // clear sessionstorage to get a fresh sessionId
      if (ws) ws.close()
    }
  }, 1000)

  window.addEventListener("beforeunload", () => {
    // will send a graceful end to the server but won't be applied if we're only navigating and reconnecting within a few seconds
    ws.close()
  })

  resetActiveTimer()
}

const Nucleus = {
  // not arrow function for access to this
  init: function (appId, options = {}) {
    useInDev = !options.disableInDev
    debug = !!options.debug
    trackingOff = !!options.disableTracking

    if (options.endpoint) endpoint = options.endpoint
    if (options.reportInterval) reportInterval = options.reportInterval
    if (options.sessionTimeout) sessionTimeout = options.sessionTimeout

    if (!appId) return console.error("Nucleus: missing app ID")

    if (!stored.anonId) save("anonId", nanoid(12))

    localData = { ...detectSessionId(), appId }

    // don't track session start if we already did
    if (!localData.existingSession) {
      this.track(null, null, "init")
    }

    initted = true

    // setup error tracking on node
    if (!options.disableErrorReports && typeof process !== "undefined") {
      process.on("uncaughtException", (err) => {
        this.trackError("uncaughtException", err)
      })

      process.on("unhandledRejection", (err) => {
        this.trackError("unhandledRejection", err)
      })
    }

    // Only if we are in a browser or renderer process
    if (typeof window !== "undefined") {
      if (!options.disableErrorReports) {
        window.onerror = (message, file, line, col, err) => {
          this.trackError("windowError", err)
        }
      }

      // Automatically send data when back online
      window.addEventListener("online", reportData)

      monitorUserInactivity()
    }

    detectData(options.useOldDeviceId).then((detectedData) => {
      localData = { ...detectedData, ...localData }

      const undetectedProps = Object.keys(localData).filter(
        (prop) => !localData[prop]
      )

      if (undetectedProps.length) {
        logWarn(
          `Some properties couldn't be detected: ${undetectedProps.join(
            ","
          )}. Set them manually or data will be missing in the dashboard.`
        )
      }

      if (isDevMode() && !useInDev)
        return log("in dev mode, not reporting data anything")

      // Make sure we stay in sync
      // And send/save regularly the latest events without spamming the server in case of bursts

      setInterval(reportData, reportInterval * 1000)
      reportData()
    })
  },

  track: (name, data = undefined, type = "event") =>
    throttle(() => {
      if (!name && !type) return
      if (trackingOff || (isDevMode() && !useInDev)) return
      if (!initted && type !== "init") return

      log("adding to queue: " + (name || type))

      // An ID for the event so when the server returns it we know it was reported
      const tempId = Math.floor(Math.random() * 1e6) + 1

      if (type === "init" && stored.props) data = stored.props

      // remove 500ms from init event to make sure it is always chronologically first
      // (otherwise the first page event might have same time)
      const timestamp =
        type === "init" ? new Date() - 500 : new Date().getTime()

      // we don't put this in "completeEvents" in case the user changes session before
      // the data can be synced, we want to keep the ref to the correct session
      const { sessionId } = localData

      const eventData = {
        type,
        name,
        id: tempId,
        date: timestamp, // make sure init is first event in db
        payload: data,
        sessionId,
      }

      save("queue", [...stored.queue, eventData])
    }),

  // Not arrow for this
  trackError: function (name, err) {
    if (!err) return
    // Convert Error to normal object, so we can stringify it
    const errObject = {
      stack: err.stack || err,
      message: err.message || err,
    }

    this.track(name, errObject, "error")
  },

  // So we can follow this user actions
  setUserId: function (newId) {
    if (!newId || newId.trim() === "") return false

    log("user id set to " + newId)

    save("userId", newId)

    // if we already initted, send the new id
    this.track(null, null, "userid")
  },

  // Allows to set custom properties to users
  setProps: function (newProps, overwrite) {
    // If it's part of the localData object overwrite there
    for (const prop in newProps) {
      if (prop in defaultProps) {
        localData[prop] = newProps[prop]
        delete newProps[prop]
      }
    }

    // Merge past and new props
    if (!overwrite) save("props", { ...stored.props, ...newProps })
    else save("props", newProps)

    if (!Object.keys(newProps).length) return

    // if we already initted, send the new props
    this.track(null, stored.props, "props")
  },

  // Allows for setting both setting user and properties at the same time
  identify: function (newId, newProps) {
    this.setUserId(newId)
    if (newProps) this.setProps(newProps, true)
  },

  // Allows for tracking of pages users are visiting
  page: function (name, params) {
    if (!name || name.trim() === "") {
      if (typeof window !== "undefined") {
        name = window.location.pathname
      } else {
        return false
      }
    }

    log("viewing screen " + name)

    this.track(name, params, "nucleus:view")
  },

  // alias for page
  screen: function (name, params) {
    this.page(name, params)
  },

  disableTracking: () => {
    trackingOff = true
    log("tracking disabled")
  },

  enableTracking: () => {
    trackingOff = false
    log("tracking enabled")
  },
}

const sendQueue = () => {
  // Connection not opened?
  if (!ws || ws.readyState !== WebSocket.OPEN) return

  log(`sending stored events (${stored.queue.length})`)

  if (!stored.queue.length) {
    // if nothing to report and user is active send a heartbeat
    save("queue", [{ type: "heartbeat", sessionId: localData.sessionId }])
  } else {
    // make sure we don't send useless heartbeat events saved previously
    // (ie. in case of network error)
    save(
      "queue",
      stored.queue.filter((event) => event.type !== "heartbeat")
    )
  }

  const data = completeEvents(stored.queue)
  log(JSON.stringify(data))
  ws.sendJson(data)
}

// Try to report the data to the server
const reportData = () => {
  // remove events older than 48 hours
  const cutoff = new Date().getTime() - 48 * 60 * 60 * 1000
  save(
    "queue",
    stored.queue.filter((event) => new Date(event.date).getTime() > cutoff)
  )

  if (trackingOff || !active) return

  // If socket was closed for whatever reason re-open it
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    log("No connection to server. Opening it.")

    ws = new WebSocket(`${endpoint}/app/${localData.appId}/track`)

    ws.onerror = (e) => logWarn(`ws error ${e.code}: ${e.reason}`)

    ws.onclose = (e) => logWarn(`ws closed ${e.code}: ${e.reason}`)

    ws.onmessage = messageFromServer

    ws.sendJson = (data) => ws.send(JSON.stringify({ data }))

    ws.onopen = (e) => {
      log("ws connection opened")
      setTimeout(sendQueue, 1000) // timeout because the connection isn't always directly ready
    }
  }

  sendQueue()
}

// Received a message from the server
const messageFromServer = (message) => {
  let data = {}

  log("server said " + message.data)

  try {
    data = JSON.parse(message.data)
  } catch (e) {
    logWarn("Could not parse message from server.")
    return
  }

  if (data.anonId) {
    log("anonId received from server " + data.anonId)
    save("anonId", data.anonId)
  }

  if (data.reportedIds || data.confirmation) {
    // Data was successfully reported, we can empty the queue
    log("Server successfully registered our data.")

    if (data.reportedIds) {
      save(
        "queue",
        stored.queue.filter((e) => !data.reportedIds.includes(e.id))
      )
    } else if (data.confirmation) {
      save("queue", [])
    }
    // Legacy handling
  }
}

const save = (what, data) => {
  stored[what] = data
  debounce(store.set("nucleus-" + what, data), 500, true)
}

const log = (msg) => {
  if (debug) console.log("Nucleus: " + msg)
}

const logWarn = (msg) => {
  if (debug) console.warn("Nucleus warning: " + msg)
}

export default Nucleus
