'use strict';

const {remote, crashReporter} = require('electron')
const request = require('request')
const WebSocket = require('ws')

const Store = require('electron-store')
const store = new Store()
const utils = require('./utils.js')

/// Data reported to server
const machineId = require('node-machine-id').machineIdSync()
const platform = process.platform.replace("darwin", "mac")
const version = utils.isDevMode() ? '0.0.0' : remote.app.getVersion()
const language = typeof navigator !== 'undefined' ? (navigator.language || navigator.userLanguage).substring(0,2) : null

// All the stuff we'll need later globally
let ws = null
let wsConfirmation = null
let latestVersion = '0.0.0'
let newUser = false
let alertedUpdate = false
let useInDev = false
let appId = null
let queue = []
let cache = {}

const apiUrl = "nucleus.sh"
//const apiUrl = "localhost:5000" // Used in dev


if (store.has('nucleus-cache')) cache = store.get('nucleus-cache')

if (store.has('nucleus-queue')) queue = store.get('nucleus-queue')
else newUser = true


module.exports = (app, options) => {

	let module = {}

	module.init = (app, options) => {

		if (typeof options === 'boolean') {
			// Legacy, will soon not work anymore
			useInDev = options
		} else {
			useInDev = !(options.disableInDev)
		}

		if (app && (!utils.isDevMode() || useInDev)) {

			appId = app

			crashReporter.start({
				productName: appId,
				companyName: 'nucleus',
				submitURL: `https://${apiUrl}/app/${appId}/crash`,
				uploadToServer: true
			})

			// The rest is only for renderer process
			if (!utils.isRenderer()) return

			queue.push({
				event: 'init',
				date: utils.getLocalTime(),
				userId: machineId,
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

		if (eventName && (!utils.isDevMode() || useInDev)) {

			queue.push({
				event: eventName,
				date: utils.getLocalTime(),
				userId: machineId
			})

			store.set('queue', queue)

			reportData()

		}

	}

	module.checkLicense = (license, callback) => {

		// No license was supplied
		if (!license || license.trim() == '')  {
			return callback(null, {
				valid: false,
				status: 'nolicense'
			})
		}
		
		// Prepare license with needed data to be sent to server
		let data = {
			key: license.trim(),
			machineId: machineId,
			platform: platform,
			version: version
		}

		// Ask for the server to validate it
		request({ url: `https://${apiUrl}/app/${appId}/license/validate`, method: 'POST', json: {data: data} }, (err, res, body) => {
			callback(err || body.error, body)
		})
	}

	module.getCustomData = (callback) => {

		// If it's already cached, pull it from here
		if (cache.customData) return callback(null, cache.customData)

		// Else go pull it on the server
		request({ url: `https://${apiUrl}/app/${appId}/customdata`, method: 'GET', json: true }, (err, res, body) => {
			callback(err || body.error, body)
		})

	}

	// So it inits if we directly pass the app id
	if (app) module.init(app, options) 

	return module

}


function checkUpdates() {
	let currentVersion = version

	let updateAvailable = !!(!settings.disableUpdates && compareVersions(currentVersion, latestVersion) < 0)

	// We call 'onNewUpdate' if the user created this function
	if (!alertedUpdate && updateAvailable && typeof Nucleus.onNewUpdate === 'function') {
		// So we don't trigger it 1000 times
		alertedUpdate = true

		Nucleus.onNewUpdate(latestVersion)
	}
} 

// Try to report the data to the server
function reportData() {

	function send() {

		// Connection not opened?
		if (!ws || ws.readyState !== WebSocket.OPEN) return

		// Send an unique random token with it to check if server successfully got it
		wsConfirmation = Math.random().toString()

		let payload = {
			confirmation: wsConfirmation,
			data: queue
		}

		ws.send(JSON.stringify(payload))
	}


	if (queue.length) {

		if (!ws) {
			ws = new WebSocket(`wss://${apiUrl}/app/${appId}/track`)

			// We are going to need to open this later
			ws.on('error', _ => console.warn)
			ws.on('close', _ => console.warn)

			ws.on('open', send )

			ws.on('message', (message) => {

				let data = JSON.parse(message)

				if (data.customData) {
					// Cache (or update cache) the custom data
					cache.customData = data.customData
					store.set('nucleus-cache', cache)
				}

				if (data.latestVersion) {
					// Get the app's latest version
					latestVersion = data.latestVersion
					checkUpdates()
				}

				if (data.confirmation === data.confirmation) {
					// Data was successfully reported, we can empty the queue (and save it)
					queue = []
					store.set('nucleus-queue', queue)
				}

			})

		} else {
			send()
		}

	}
}