'use strict';

const {remote, crashReporter} = require('electron')
const request = require('request')

const Store = require('electron-store')
const store = new Store()

/// Thanks to jprichardson/is-electron-renderer
function isRenderer () {
	if (typeof process === 'undefined' || !process) return true // running in a web browser or node-integration is disabled
	if (!process.type) return false // We're in node.js somehow
	return process.type === 'renderer'
}

//  From sindresorhus/electron-is-dev, thanks to the author
const getFromEnv = parseInt(process.env.ELECTRON_IS_DEV, 10) === 1
const isEnvSet = 'ELECTRON_IS_DEV' in process.env
const devModeEnabled = isEnvSet ? getFromEnv : (process.defaultApp || /node_modules[\\/]electron[\\/]/.test(process.execPath))
/////////

const apiUrl = "https://nucleus.sh"
//const apiUrl = "http://localhost:5000"

/// Data reported to server
const userId = require('node-machine-id').machineIdSync()
const platform = process.platform.replace("darwin", "mac")
const version = devModeEnabled ? '0.0.0' : remote.app.getVersion()
const language = typeof navigator !== 'undefined' ? (navigator.language || navigator.userLanguage).substring(0,2) : null
//////
let newUser = false

let appId
let queue = []

let useInDev = false

if (store.has('queue')) queue = store.get('queue')
else newUser = true

module.exports = (app, dev) => {

	let module = {}

	module.init = (app, dev) => {
		useInDev = dev

		if (app && (!devModeEnabled || useInDev)) {

			appId = app

			crashReporter.start({
				productName: appId,
				companyName: 'nucleus',
				submitURL: `${apiUrl}/app/${appId}/crash`,
				uploadToServer: true
			})

			if (!isRenderer()) return

			queue.push({
				event: 'init',
				date: new Date().toISOString().slice(0, 10),
				userId: userId,
				platform: platform,
				version: version,
				language: language,
				newUser: newUser
			})

			store.set('queue', queue)
			reportData()

			// Automatically send data when back online
			window.addEventListener('online', _ => {
				reportData()
			})

		}
	}

	module.track = (eventName) => {

		if (eventName && (!devModeEnabled || useInDev)) {

			queue.push({
				event: eventName,
				date: new Date().toISOString().slice(0, 10),
				userId: userId
			})

			store.set('queue', queue)

			reportData()

		}

	}

	module.checkLicense = (license, callback) => {

		if (license) {
			request({ url: `${apiUrl}/app/${appId}/license/${license}`, method: 'GET', json: true }, (err, res, body) => {

				callback(err, body)

			})
		}
	}


	if (app) module.init(app, dev) // So it inits if we directly pass the app id

	return module

}


// Try to report the data to the server
function reportData() {
	if (queue.length) {
		request({ url: `${apiUrl}/app/${appId}/track`, method: 'POST', json: {data: queue} }, (err, res, body) => {

			if (err) {
				// No internet or error with server
				// Data will be sent with next request

			} else {
				// Data was successfully reported

				queue = []

				store.set('queue', queue)

			}

		})
	}
}