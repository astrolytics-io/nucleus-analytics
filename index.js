'use strict';

const {remote, app, crashReporter} = require('electron')
const request = require('request')
const os = require('os')
const WebSocket = require('ws')

const Store = require('electron-store')
const store = new Store({
	encryptionKey: 's0meR1nd0mK3y', // for obfuscation
	name: 'nucleus' // Doesn't interferate if app is using electron-store
})

const utils = require('./utils.js')

const appObject = remote ? remote.app : app // Depends on process

const moduleVersion = require('./package.json').version

/// Data reported to server
let userId = null
let machineId = require('node-machine-id').machineIdSync()
let platform = process.platform.replace("darwin", "mac")
let version = utils.isDevMode() ? '0.0.0' : appObject.getVersion()
let language = typeof navigator !== 'undefined' ? (navigator.language || navigator.userLanguage).substring(0,2) : null
let arch = process.arch
let sessionId = null
let osVersion = os.release()
let totalRam = os.totalmem() / Math.pow(1024, 3)

// All the stuff we'll need later globally
let dev = false // Internal use only, for developing with Nucleus dev
let apiUrl = "nucleus.sh"

let ws = null
let wsConfirmation = null
let appId = null
let latestVersion = '0.0.0'
let newUser = false
let alertedUpdate = false
let useInDev = true
let enableLogs = false
let disableTracking = false
let queue = []
let cache = {}

let tempUserEvents = {}

if (store.has('nucleus-cache')) cache = store.get('nucleus-cache')

if (store.has('nucleus-queue')) queue = store.get('nucleus-queue')
else newUser = true


let Nucleus = (initAppId, options = {}) => {

	let module = {}

	// not arrow function for access to this
	module.init = function(initAppId, options) {

		appId = initAppId

		if (typeof options === 'boolean') {
			// Legacy, will soon not work anymore
			useInDev = options
		} else {
			useInDev = !(options.disableInDev)

			if (options.userId) userId = options.userId
			if (options.version) version = options.version
			if (options.language) language = options.language
			if (options.endpoint) apiUrl = options.endpoint
			if (options.devMode) dev = options.devMode
			if (options.enableLogs) enableLogs = options.enableLogs
			if (options.disableTracking) disableTracking = options.disableTracking
		}

		sessionId = Math.floor(Math.random() * 1e4) + 1


		if (appId && (!utils.isDevMode() || useInDev)) {
			
			crashReporter.start({
				productName: appId,
				companyName: 'nucleus',
				submitURL: `http${dev ? '' : 's'}://${apiUrl}/app/${appId}/crash`,
				uploadToServer: true,
				extra: {
					userId: userId,
					version: version
				}
			})

			if (!options.disableErrorReports) {
				process.on('uncaughtException', err => {
					this.trackError('uncaughtException', err)
				})

				process.on('unhandledRejection', err => {
					this.trackError('unhandledRejection', err)
				})
			}

			// The rest is only for renderer process
			if (!utils.isRenderer()) {
				if (options.onlyMainProcess) this.track('init')
				return
			}

			this.track('init')

			if (!options.disableErrorReports) {
				window.onerror = (message, file, line, col, err) => {
					this.trackError('windowError', err)
				}
			}

			// Automatically send data when back online
			window.addEventListener('online', _ => {
				reportData()
			})

		}
		
	}

	module.track = (eventName, options = {}) => {

		if (!eventName || disableTracking || (utils.isDevMode() && !useInDev)) return

		if (enableLogs) console.log('Nucleus: reporting event '+eventName)

		// If we want the event to only be reportable once per user
		if (userId && options.uniqueToUser) {
			if (tempUserEvents[userId]) {

				if (tempUserEvents[userId].includes(eventName)) {
					return // We already tracked this event
				} else {
					tempUserEvents[userId].push(eventName)
				}
			
			} else {
				tempUserEvents[userId] = [eventName]
			}
		}

		queue.push({
			appType: 'electron',
			event: eventName,
			date: utils.getLocalTime(),
			appId: appId,
			userId: userId,
			sessionId: sessionId,
			machineId: machineId,
			platform: platform,
			osVersion: osVersion,
			totalRam: totalRam,
			version: version,
			language: language,
			uniqueToUser: options.uniqueToUser,
			arch: arch,
			payload: options.payload || null,
			process: utils.isRenderer() ? 'renderer' : 'main',
			moduleVersion: moduleVersion
		})

		store.set('queue', queue)

		reportData()

	}

	// DEPRECATED
	// Licensing integration in Nucleus
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
			userId: userId,
			machineId: machineId,
			platform: platform,
			version: version
		}


		// Ask for the server to validate it
		request({ url: `http${dev ? '' : 's'}://${apiUrl}/app/${appId}/license/validate`, method: 'POST', json: {data: data} }, (err, res, body) => {
			callback(err || body.error, body)
		})
	}

	// Not arrow for this
	module.trackError = function(type, err) {
		// Convert Error to normal object, so we can stringify it
		let errObject = {
			stack: err.stack || err,
			message: err.message || err
		}

		this.track('error:'+type, {
			payload: errObject
		})

		if (typeof this.onError === 'function') this.onError(type, err)
	}


	// Get the custom JSON data set from the dashboard
	module.getCustomData = (callback) => {

		// If it's already cached, pull it from here
		if (cache.customData) return callback(null, cache.customData)

		// Else go pull it on the server
		request({ url: `http${dev ? '' : 's'}://${apiUrl}/app/${appId}/customdata`, method: 'GET', json: true }, (err, res, body) => {
			callback(err || body.error, body)
		})

	}

	module.setUserId = function(newId) {
		if (!newId || newId.trim() === '') return false
		
		if (enableLogs) console.log('Nucleus: user id set to '+newId)
		
		userId = newId
		
		this.track('nucleus:beacon') // So we can know what the specs of this user
		
		return true
	}

	module.disableTracking = () => {
		if (enableLogs) console.log('Nucleus: tracking disabled')

		disableTracking = true
	}

	module.enableTracking = () => {
		if (enableLogs) console.log('Nucleus: tracking enabled')
		
		disableTracking = false
	}

	// So it inits if we directly pass the app id
	if (initAppId) module.init(initAppId, options) 

	return module

}

const checkUpdates = () => {
	let currentVersion = version

	let updateAvailable = !!(utils.compareVersions(currentVersion, latestVersion) < 0)

	// We call 'onUpdate' if the user created this function
	if (!alertedUpdate && updateAvailable && Nucleus && typeof Nucleus.onUpdate === 'function') {
		// So we don't trigger it 1000 times
		alertedUpdate = true

		Nucleus.onUpdate(latestVersion)
	}
} 


const sendQueue = () => {

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


// Try to report the data to the server
const reportData = () => {

	// Nothing to report
	if (!queue.length) return

	if (!ws || ws.readyState !== WebSocket.OPEN) {

		if (enableLogs) console.warn('Nucleus: no connection to server. Opening it.')

		// Wss (https equivalent) if production
		ws = new WebSocket(`ws${dev ? '' : 's'}://${apiUrl}/app/${appId}/track`)

		// We are going to need to open this later
		ws.on('error', _ => console.warn)
		ws.on('close', _ => console.warn)

		ws.on('message', messageFromServer)

		ws.on('open', sendQueue )

	} else {
		sendQueue()
	}

}

const messageFromServer = (message) => {

	let data = {}
	
	try {
		data = JSON.parse(message)
	} catch (e) {
		if (enableLogs) console.warn('Nucleus: could not parse message from server.')
		return
	}

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

	if (data.confirmation === wsConfirmation) {
		// Data was successfully reported, we can empty the queue
		queue = []
		store.set('nucleus-queue', queue)
	}

}

module.exports = Nucleus