export const isDevMode = () => {
  if (typeof process !== "undefined") {
    try {
      //  From sindresorhus/electron-is-dev, thanks to the author
      const getFromEnv = parseInt(process.env.ELECTRON_IS_DEV, 10) === 1
      const isEnvSet = "ELECTRON_IS_DEV" in process.env
      return isEnvSet
        ? getFromEnv
        : process.defaultApp ||
            /node_modules[\\/]electron[\\/]/.test(process.execPath)
    } catch (e) {}
  } else if (typeof window !== "undefined") {
    // check if url is localhost
    return window.location.hostname === "localhost"
  }

  return false
}

export const getStore = () => {
  /* Will fail if no Node (like webpack) */
  try {
    const Conf = require("conf")

    const options = {
      encryptionKey: "s0meR1nd0mK3y", // for obfuscation
      configName: "nucleus",
    }

    try {
      // That's basically what the electron-store module does
      // Save to the appropriate app location
      // but we save the electron dependency and instead try to require it

      const { remote, app } = require("electron")
      const electronApp = remote ? remote.app : app // Depends on process
      const defaultCwd = electronApp.getPath("userData")

      options.cwd = defaultCwd
    } catch (e) {
      // No electron, default to conf default location
    }

    const store = new Conf(options)

    return store
  } catch (e) {
    // Fallback to localStorage and mimick the API of 'conf'
    if (typeof localStorage !== "undefined") {
      return {
        get: (key) => {
          return JSON.parse(localStorage.getItem(key))
        },
        set: (key, value) => {
          localStorage.setItem(key, JSON.stringify(value))
        },
      }
    } else {
      console.warn(
        "Nucleus: could not find a way to store cache. Offline events and persistance won't work!"
      )

      // Send a factice handler so calls don't fail
      return {
        get: () => {},
        set: () => {},
      }
    }
  }
}

// we use this for the save() calls to prevent EPERM & EBUSY errors
export const debounce = (func, interval) => {
  let timeout

  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }

    clearTimeout(timeout)
    timeout = setTimeout(later, interval)
  }
}

export const getWsClient = () => {
  /* If natively available (browser env) return it */
  if (typeof WebSocket !== "undefined") return WebSocket
  return require("ws")
}
