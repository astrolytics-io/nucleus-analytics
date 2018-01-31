module.exports = {

	isRenderer: () => {
		/// Thanks to jprichardson/is-electron-renderer
		if (typeof process === 'undefined' || !process) return true // running in a web browser or node-integration is disabled
		if (!process.type) return false // We're in node.js somehow
		return process.type === 'renderer'
	},
	isDevMode: () => { 
		//  From sindresorhus/electron-is-dev, thanks to the author
		const getFromEnv = parseInt(process.env.ELECTRON_IS_DEV, 10) === 1
		const isEnvSet = 'ELECTRON_IS_DEV' in process.env
		return isEnvSet ? getFromEnv : (process.defaultApp || /node_modules[\\/]electron[\\/]/.test(process.execPath))
	}

}