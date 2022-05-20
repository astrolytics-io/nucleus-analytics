const createSessionId = () => Math.floor(Math.random() * 1e6) + 1

const detectData = async () => {
  const localData = {
    appId: null,
    userId: null,
    machineId: null,
    version: "0.0.0",
    locale: null,
    platform: null,
    sessionId: null,
    osVersion: null,
    totalRam: null,
    browser: null,
    existingSession: false,
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
    const uniqueId = await machineId.default.machineId()

    const osLocale = await import("os-locale")

    localData.platform = os.type()
    localData.osVersion = os.release()
    localData.totalRam = os.totalmem() / Math.pow(1024, 3)
    localData.locale = osLocale.sync()
    localData.machineId = uniqueId
  } else if (typeof navigator !== "undefined") {
    // Looks like Node is not available. Detecting without

    const { ClientJS } = await import("clientjs")
    const client = new ClientJS()

    localData.platform = client.getOS()
    localData.osVersion = client.getOSVersion()
    localData.locale = client.getLanguage()
    localData.totalRam = navigator.deviceMemory
    localData.machineId = client.getFingerprint()
    localData.browser = client.getBrowser()
  }

  // see if the session id is set in sessionstorage otherwise create it
  if (typeof sessionStorage !== "undefined") {
    if (sessionStorage.getItem("sessionId")) {
      localData.sessionId = sessionStorage.getItem("sessionId")
      localData.existingSession = true
    } else {
      localData.sessionId = createSessionId()
      sessionStorage.setItem("sessionId", localData.sessionId)
    }
  } else {
    localData.sessionId = createSessionId()
  }

  return localData
}

export default detectData
