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

export const detectData = async () => {
  const data = {
    deviceId: null,
    version: "0.0.0",
    locale: null,
    platform: null,
    osVersion: null,
  }

  /* Try to find version with Electron */
  try {
    const { remote, app } = await import("electron")
    const electronApp = remote ? remote.app : app // Depends on process

    localData.version = isDevMode() ? "0.0.0" : electronApp.getVersion()
  } catch (e) {
    // log("Looks like it's not an Electron app.")
    // Electron not available
  }

  if (typeof process !== "undefined") {
    /* Find with Node */
    /* And fallback to browser info else */

    const os = await import("os")
    const machineId = await import("node-machine-id")
    const username = os.userInfo().username
    const uniqueId = await machineId.default.machineId()
    const osLocale = await import("os-locale")

    data.platform = os.type()
    data.osVersion = os.release()
    data.locale = osLocale.sync()
    data.deviceId = uniqueId + username // unique per user session
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

  return data
}
