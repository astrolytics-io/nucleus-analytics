module.exports = {
  isDevMode: () => {
    try {
      //  From sindresorhus/electron-is-dev, thanks to the author
      const getFromEnv = parseInt(process.env.ELECTRON_IS_DEV, 10) === 1
      const isEnvSet = 'ELECTRON_IS_DEV' in process.env
      return isEnvSet ? getFromEnv : (process.defaultApp || /node_modules[\\/]electron[\\/]/.test(process.execPath))
    } catch (e) {
      console.warn("Nucleus: Could not detect if we're in dev mode, defaulting to false.")
      return false
    }
  },
  generateUserId: () => {
    try {
      const os = require('os')
      const hostname = os.hostname()
      const username = os.userInfo().username

      return username + '@' + hostname
    } catch (e) {
      console.warn('Nucleus: Could not autodetect an user id.')
      return null
    }
  },
  getStore: () => {
    /* Will fail if no Node (like webpack) */
    try {
      const Conf = require('conf')

      const options = {
        encryptionKey: 's0meR1nd0mK3y', // for obfuscation
        configName: 'nucleus'
      }

      try {
        // That's basically what the electron-store module does
        // Save to the appropriate app location
        // but we save the electron dependency and instead try to require it

        const { remote, app } = require('electron')
        const electronApp = remote ? remote.app : app // Depends on process
        const defaultCwd = electronApp.getPath('userData')

        options.cwd = defaultCwd
      } catch (e) {
        // No electron, default to conf default location
      }

      const store = new Conf(options)

      return store
    } catch (e) {
      // Fallback to localStorage and mimick the API of 'conf'
      if (typeof localStorage !== 'undefined') {
        return {
          get: (key) => {
            return JSON.parse(localStorage.getItem(key))
          },
          set: (key, value) => {
            localStorage.setItem(key, JSON.stringify(value))
          }
        }
      } else {
        console.warn("Nucleus: could not find a way to store cache. Offline events and persistance won't work!")

        // Send a factice handler so calls don't fail
        return {
          get: () => { },
          set: () => { }
        }
      }
    }
  },
  // we use this for the save() calls to prevent EPERM & EBUSY errors
  debounce: (func, interval) => {
    let timeout

    return function executedFunction (...args) {
      const later = () => {
        clearTimeout(timeout)
        func(...args)
      }

      clearTimeout(timeout)
      timeout = setTimeout(later, interval)
    }
  },
  compareVersions (a, b) {
    let i, diff
    const regExStrip0 = /(\.0+)+$/
    const segmentsA = a.replace(regExStrip0, '').split('.')
    const segmentsB = b.replace(regExStrip0, '').split('.')
    const l = Math.min(segmentsA.length, segmentsB.length)

    for (i = 0; i < l; i++) {
      diff = parseInt(segmentsA[i], 10) - parseInt(segmentsB[i], 10)
      if (diff) return diff
    }

    return segmentsA.length - segmentsB.length
  },
  getWsClient () {
    /* If natively available (browser env) return it */
    if (typeof WebSocket !== 'undefined') return WebSocket
    return require('ws')
  },
  getNavigatorOS: () => {
    const nAgt = navigator.userAgent
    let osVersion = null
    let os = null
    // system

    const clientStrings = [
      { s: 'Windows 3.11', r: /Win16/ },
      { s: 'Windows 95', r: /(Windows 95|Win95|Windows_95)/ },
      { s: 'Windows ME', r: /(Win 9x 4.90|Windows ME)/ },
      { s: 'Windows 98', r: /(Windows 98|Win98)/ },
      { s: 'Windows CE', r: /Windows CE/ },
      { s: 'Windows 2000', r: /(Windows NT 5.0|Windows 2000)/ },
      { s: 'Windows XP', r: /(Windows NT 5.1|Windows XP)/ },
      { s: 'Windows Server 2003', r: /Windows NT 5.2/ },
      { s: 'Windows Vista', r: /Windows NT 6.0/ },
      { s: 'Windows 7', r: /(Windows 7|Windows NT 6.1)/ },
      { s: 'Windows 8.1', r: /(Windows 8.1|Windows NT 6.3)/ },
      { s: 'Windows 8', r: /(Windows 8|Windows NT 6.2)/ },
      { s: 'Windows NT 4.0', r: /(Windows NT 4.0|WinNT4.0|WinNT|Windows NT)/ },
      { s: 'Windows ME', r: /Windows ME/ },
      { s: 'Android', r: /Android/ },
      { s: 'Open BSD', r: /OpenBSD/ },
      { s: 'Sun OS', r: /SunOS/ },
      { s: 'Linux', r: /(Linux|X11)/ },
      { s: 'iOS', r: /(iPhone|iPad|iPod)/ },
      { s: 'Mac OS X', r: /Mac OS X/ },
      { s: 'Mac OS', r: /(MacPPC|MacIntel|Mac_PowerPC|Macintosh)/ },
      { s: 'QNX', r: /QNX/ },
      { s: 'UNIX', r: /UNIX/ },
      { s: 'BeOS', r: /BeOS/ },
      { s: 'OS/2', r: /OS\/2/ }
    ]

    for (const id in clientStrings) {
      const cs = clientStrings[id]
      if (cs.r.test(nAgt)) {
        os = cs.s
        break
      }
    }

    if (/Windows/.test(os)) {
      const osVersionResult = /Windows (.*)/.exec(os)
      if (osVersionResult && osVersionResult.length > 1) {
        osVersion = osVersionResult[1]
      }
      os = 'Windows'
    }

    if (/Mac OS X/.test(os)) {
      const osVersionResult = /Mac OS X ([0-9]*[._\d]+)/.exec(nAgt)
      if (osVersionResult && osVersionResult.length > 1) {
        osVersion = osVersionResult[1]
      }
    }

    return {
      name: os,
      version: osVersion
    }
  }

}
