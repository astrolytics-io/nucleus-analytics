'use strict';

const { remote, app } = require('electron')
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
let apiUrl = "app.nucleus.sh"

let ws = null
let appId = null
let latestVersion = '0.0.0'
let newUser = false
let alertedUpdate = false
let useInDev = true
let enableLogs = false
let disableTracking = false
let queue = []
let cache = {}
let reportDelay = 20
let onlyMainProcess = false
let persist = true

let tempUserEvents = {}

if (store.has('nucleus-cache')) {
	cache = store.get('nucleus-cache')
} else {
	newUser = true
}

if (persist && store.has('nucleus-queue')) queue = store.get('nucleus-queue')


let Nucleus = (initAppId, options = {}) => {

	let module = {}

	// not arrow function for access to this
	module.init = function(initAppId, options = {}) {

		appId = initAppId

		useInDev = !(options.disableInDev)

		if (options.userId) userId = options.userId
		if (options.version) version = options.version
		if (options.language) language = options.language
		if (options.endpoint) apiUrl = options.endpoint
		if (options.devMode) dev = options.devMode
		if (options.enableLogs) enableLogs = options.enableLogs
		if (options.disableTracking) disableTracking = options.disableTracking
		if (options.reportDelay) reportDelay = options.reportDelay
		if (options.onlyMainProcess) onlyMainProcess = options.onlyMainProcess
		if (options.persist) persist = options.persist

		sessionId = Math.floor(Math.random() * 1e4) + 1

		if (appId && (!utils.isDevMode() || useInDev)) {

			if (!options.disableErrorReports) {
				process.on('uncaughtException', err => {
					this.trackError('uncaughtException', err)
				})

				process.on('unhandledRejection', err => {
					this.trackError('unhandledRejection', err)
				})
			}

			// Make sure we stay in sync
			// Keeps live list of users updated too
			setInterval(() => {
				reportData()
			}, reportDelay * 1000)


			if (!utils.isRenderer()) {

				// Force tracking of init if we're only going to use
				// the module in the main
				if (onlyMainProcess) {
					this.track('init')
					reportData()
				}

				return
			}

			// The rest is only for renderer process

			this.track('init')
			reportData()

			if (!options.disableErrorReports) {
				window.onerror = (message, file, line, col, err) => {
					this.trackError('windowError', err)
				}
			}

			// Automatically send data when back online
			window.addEventListener('online', reportData)
		}
	}


	module.track = (eventName, data) => {

		if (!eventName || disableTracking || (utils.isDevMode() && !useInDev)) return

		if (enableLogs) console.log('Nucleus: adding to reporting queue event '+eventName)

		// An ID for the event so when the server returns it we know it was reported
		let tempId = Math.floor(Math.random() * 1e6) + 1

		let eventData = {
			event: eventName,
			date: new Date(),
			appId: appId,
			id: tempId,
			userId: userId,
			machineId: machineId,
			sessionId: sessionId,
			payload: data || undefined
		}

		let extra = {
			platform: platform,
			osVersion: osVersion,
			totalRam: totalRam,
			version: version,
			language: language,
			process: utils.isRenderer() ? 'renderer' : 'main',
			arch: arch,
			moduleVersion: moduleVersion
		}

		// So we don't send unnecessary data with every events
		// Only when needed (= first opening, after reporting user and on error)
		if (['init', 'nucleus:beacon'].includes(eventName) || eventName.includes("error:")) {
			Object.keys(extra).forEach((key) => eventData[key] = extra[key] )
		}

		queue.push(eventData)

		if (persist) store.set('queue', queue)
	}

	module.setProps = function(props) {
		if (props.userId) userId = props.userId
		this.track('nucleus:props', props)
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

		this.track('error:'+type, errObject)

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
	if (!ws || ws.readyState !== WebSocket.OPEN) {
		// persists current queue in case app is closed before sync
		if (persist) store.set('nucleus-queue', queue)
		return
	}
	// Nothing to report
	if (!queue.length) return

	let payload = {
		data: queue
	}

	if (enableLogs) console.log('Nucleus: sending cached events ('+queue.length+')')

	ws.send(JSON.stringify(payload))
}


// Try to report the data to the server
const reportData = () => {

	// If nothing to report no need to reopen connection if in main process
	// Except if we only report from main process
	if (!queue.length && (!utils.isRenderer() && !onlyMainProcess)) return

	if (disableTracking) return

	// If socket was closed for whatever reason re-open it

	if (!ws || ws.readyState !== WebSocket.OPEN) {

		if (enableLogs) console.warn('Nucleus: no connection to server. Opening it.')

		// Wss (https equivalent) if production
		ws = new WebSocket(`ws${dev ? '' : 's'}://${apiUrl}/app/${appId}/track`)

		// We are going to need to open this later
		ws.on('error', (e) => {
			if (enableLogs) console.warn(e)
		})
		ws.on('close', (e) => {
			if (enableLogs) console.warn(e)
		})

		ws.on('message', messageFromServer)

		ws.on('open', sendQueue )

	}

	if (queue.length) sendQueue()
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

	if (data.reportedIds || data.confirmation) {
		// Data was successfully reported, we can empty the queue
		if (enableLogs) console.log('Nucleus: server successfully registered data')

		if (data.reportedIds) queue = queue.filter(e => !data.reportedIds.includes(e.id))
		else if (data.confirmation) queue = [] // Legacy handling

		if (persist) store.set('nucleus-queue', queue)
	}

}

module.exports = Nucleus
