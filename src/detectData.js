import { isDevMode } from "./utils.js"

const createSessionId = () => Math.floor(Math.random() * 1e6) + 1

export const detectSessionId = () => {
  // see if the session id is set in sessionstorage otherwise create it

  const data = {}

  if (typeof sessionStorage !== "undefined") {
    if (sessionStorage.getItem("nuc-sId")) {
      data.sessionId = sessionStorage.getItem("nuc-sId")
      data.existingSession = true
    } else {
      data.sessionId = createSessionId()
      sessionStorage.setItem("nuc-sId", data.sessionId)
    }
  } else {
    data.sessionId = createSessionId()
  }

  return data
}

export const defaultProps = {
  deviceId: null,
  version: null,
  locale: null,
  platform: null,
  osVersion: null,
}

export const detectData = async (useOldDeviceId) => {
  const data = { ...defaultProps }

  // try/catch as we don't want a unhandled problem in data detection
  // to prevent the rest of the 'init' sequence
  try {
    // Try to find version with Electron
    try {
      const { remote, app } = await import("electron")
      // Depends on process, remote won't work on Electron 10+ as remote is not packaged anymore
      const electronApp = remote ? remote.app : app
      data.version = electronApp.getVersion()
    } catch (e) {
      // log("Looks like it's not an Electron app.")
      // Electron not available
    }

    if (typeof process !== "undefined") {
      // Try to find with Node, and fallback to browser info else

      const os = await import("os")
      const cryptoNode = await import("crypto")
      const nodeMachineId = await import("node-machine-id")
      const osLocale = await import("os-locale")

      const uniqueId = await nodeMachineId.default.machineId()

      const username = os.userInfo().username

      // create shorted id from sha256 hash
      // collision risk is not too worrying here
      const deviceId = useOldDeviceId
        ? uniqueId
        : cryptoNode
            .createHash("sha256")
            .update(uniqueId + username)
            .digest("base64")
            .substring(0, 15)

      data.platform = os.type()
      data.osVersion = os.release()
      data.locale = osLocale.osLocaleSync()
      data.deviceId = deviceId // unique per user session
    } else if (typeof navigator !== "undefined") {
      // Looks like Node is not available. Detecting without

      const { ClientJS } = await import("clientjs")
      const client = new ClientJS()

      // save it because in some rare cases it changes later (ie. iPad changing orientation)
      if (localStorage.getItem("nucleus-dId")) {
        data.deviceId = localStorage.getItem("nucleus-dId")
      } else {
        data.deviceId = client.getFingerprint().toString()
        localStorage.setItem("nucleus-dId", data.deviceId)
      }

      const isIpad =
        (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 0) ||
        navigator.platform === "iPad" // iPad Pros UA is same as Mac, so need to look at touchpoints

      data.platform = isIpad ? "iPadOS" : client.getOS()

      data.osVersion = isIpad
        ? client.getBrowserVersion() // iOS version is same as browser version
        : client.isMac() // on mac the OS version is not reliable https://bugs.webkit.org/show_bug.cgi?id=216593
        ? null
        : client.getOSVersion()
      data.locale = client.getLanguage()
      data.browser = client.getBrowser()
    }
  } catch (e) {
    console.error(e)
  }

  return data
}
