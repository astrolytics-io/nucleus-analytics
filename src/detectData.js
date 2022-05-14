const autoDetectData = async () => {
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
  }

  // Try to find the package version with the package.json file
  try {
    const packageJson = await import("../package.json")
    localData.version = packageJson.version
  } catch (e) {
    log("Could not find package.json file")
  }

  /* Try to find version with Electron */
  try {
    const { remote, app } = require("electron")
    const electronApp = remote ? remote.app : app // Depends on process

    localData.version = isDevMode() ? "0.0.0" : electronApp.getVersion()
  } catch (e) {
    log("Looks like it's not an Electron app.")
    // Electron not available
  }

  /* Try to find OS stuff with Node */
  /* And fallback to browser info else */
  try {
    const os = await import("os")
    const machineId = await import("node-machine-id")
    const uniqueId = await machineId.default.machineId()

    const osLocale = await import("os-locale")

    localData.platform = os.type()
    localData.osVersion = os.release()
    localData.totalRam = os.totalmem() / Math.pow(1024, 3)
    localData.locale = osLocale.sync()
    localData.machineId = uniqueId
  } catch (e) {
    // Looks like Node is not available. Detecting without

    if (typeof navigator !== "undefined") {
      const { ClientJS } = await import("clientjs")
      const client = new ClientJS()

      localData.platform = client.getOS()
      localData.osVersion = client.getOSVersion()
      localData.locale = client.getLanguage()
      localData.totalRam = navigator.deviceMemory
      localData.machineId = client.getFingerprint()
      localData.browser = client.getBrowser()
    }
  }

  const undetectedProps = Object.keys(localData).filter(
    (prop) => !localData[prop]
  )

  if (undetectedProps.length) {
    logError(
      `Some properties couldn't be autodetected: ${undetectedProps.join(
        ","
      )}. Set them manually or data will be missing in the dashboard.`
    )
  }
}

export default autoDetectData
