'use strict';

const {
	getWsClient,
	getStore,
	isDevMode,
	getNavigatorOS,
	generateUserId,
	compareVersions,
	debounce
} = require('./utils.js')

/* Either from browser or Node 'ws' */
const WebSocket = getWsClient()
const store 	= getStore()

/// Data reported to server
const localData = {
	appId: null,
	userId: null,
	machineId: null,
	version: '0.0.0',
	locale: null,
	platform: null,
	arch: require('arch')(), // Module works both browser and node
	sessionId: null,
	osVersion: null,
	totalRam: null,
	moduleVersion: require('./package.json').version
}

// Options that can be changed by the user
let endpoint 		= "wss://app.nucleus.sh"
let useInDev 		= true
let debug 			= false
let trackingOff 	= false
let reportInterval 	= 20

// All the stuff we'll need later globally
let ws 				= null
let latestVersion 	= '0.0.0'
let gotInitted 		= false 
let alertedUpdate 	= false

let queue 			= store.get('nucleus-queue') || []
let props 			= store.get('nucleus-props') || {}
let cache 			= store.get('nucleus-cache') || {}

const Nucleus = {

	// not arrow function for access to this
	init: function(initAppId, options = {}) {

		autoDetectData()

		localData.appId = initAppId

		useInDev = !options.disableInDev
		debug = !!options.debug
		trackingOff = !!options.disableTracking

		if (options.autoUserId) localData.userId = generateUserId()
		if (options.endpoint) endpoint = options.endpoint
		
		if (options.reportInterval) reportInterval = options.reportInterval

		localData.sessionId = Math.floor(Math.random() * 1e6) + 1

		if (localData.appId && (!isDevMode() || useInDev)) {

			// Make sure we stay in sync
			// And save regularly to disk the latest events
			// Keeps live list of users updated too
			setInterval(reportData, reportInterval * 1000)

			if (!options.disableErrorReports && typeof process !== 'undefined') {
				process.on('uncaughtException', err => {
					this.trackError('uncaughtException', err)
				})

				process.on('unhandledRejection', err => {
					this.trackError('unhandledRejection', err)
				})
			}

			// Only if we are in a browser or renderer process
			if (typeof window === 'undefined') return

			if (!options.disableErrorReports) {
				window.onerror = (message, file, line, col, err) => {
					this.trackError('windowError', err)
				}
			}

			// Automatically send data when back online
			window.addEventListener('online', reportData)
		}
	},

	/* Should only be ran once per session */
	appStarted: function() {
		gotInitted = true

		this.track(null, null, 'init')

		reportData()
	},

	track: (eventName, data=undefined, type='event') => {

		if (!localData.appId) return logError('Missing APP ID before we can start tracking.')
 
		if (!eventName && !type) return
		if (trackingOff || (isDevMode() && !useInDev)) return

		log('adding to queue: ' + (eventName || type))

		// An ID for the event so when the server returns it we know it was reported
		let tempId = Math.floor(Math.random() * 1e6) + 1

		if (type === 'init' && props) data = props

		let eventData = {
			type: type,
			name: eventName,
			date: new Date(),
			appId: localData.appId,
			id: tempId,
			userId: localData.userId,
			machineId: localData.machineId,
			sessionId: localData.sessionId,
			payload: data
		}

		// So we don't send unnecessary data when not needed 
		// (= first event, and on error)
		if (type && ['init', 'error'].includes(type)) {

			let extra = {
				client: 'nodejs',
				platform: localData.platform,
				osVersion: localData.osVersion,
				totalRam: localData.totalRam,
				version: localData.version,
				locale: localData.locale,
				arch: localData.arch,
				moduleVersion: localData.moduleVersion
			}

			Object.keys(extra).forEach((key) => eventData[key] = extra[key] )
		}

		queue.push(eventData)
	},

	// Not arrow for this
	trackError: function(name, err) {
		// Convert Error to normal object, so we can stringify it
		let errObject = {
			stack: err.stack || err,
			message: err.message || err
		}

		this.track(name, errObject, 'error')

		if (typeof this.onError === 'function') this.onError(name, err)
	},

	// Get the custom JSON data set from the dashboard
	getCustomData: (callback) => {

		// If it's already cached, pull it from here
		return callback(null, cache.customData)
	},

	// So we can follow this user actions
	setUserId: function(newId) {
		if (!newId || newId.trim() === '') return false

		log('user id set to '+newId)

		localData.userId = newId

		// only send event if we didn't init, else will be passed with init
		if (gotInitted) this.track(null, null, 'userid') 
	},

	// Allows to set custom properties to users
	setProps: function(newProps, overwrite) {

		// If it's part of the localData object overwrite there
		for (let prop in newProps) {
			if (localData[prop]) {
				localData[prop] = newProps[prop]
				newProps[prop] = null
			}
		}

		// Merge past and new props
		if (!overwrite) props = Object.assign(props, newProps)
		else props = newProps
			
		debounce(() => store.set('nucleus-props', props))

		// only send event if we didn't init, else will be passed with init
		if (gotInitted) this.track(null, props, 'props')
	},

	disableTracking: () => {
		trackingOff = true
		log('tracking disabled')
	},

	enableTracking: () => {
		trackingOff = false
		log('tracking enabled')
	},

	// Checks locally if the current version is inferior to 'latest'
	// Called if the server returned a 'latest' version
	checkUpdates: function() {
		let currentVersion = localData.version

		let updateAvailable = !!(compareVersions(currentVersion, latestVersion) < 0)

		// We call 'Nucleus.onUpdate' if the user created this function
		if (!alertedUpdate && updateAvailable && typeof this.onUpdate === 'function') {
			// So we don't trigger it 1000 times
			alertedUpdate = true

			this.onUpdate(latestVersion)
		}
	}
}

const sendQueue = () => {

	// Connection not opened?
	if (!ws || ws.readyState !== WebSocket.OPEN) {
		// persists current queue in case app is closed before sync
		store.set('nucleus-queue', queue)
		return
	}

	if (!queue.length) { 
		
		// Nothing to report, send a heartbeat anyway
		// (like if the connection was lost and is back)
		// only machine id is needed to derive the other infos server-side
		
		const heartbeat = {
			type: 'heartbeat',
			machineId: localData.machineId
		}

		return ws.send(JSON.stringify({ data: [ heartbeat ] }))
	}

	const payload = { data: queue }

	log('sending cached events ('+queue.length+')')

	ws.send(JSON.stringify(payload))
}


// Try to report the data to the server
const reportData = () => {

	// Write to file in case we are offline to save data
	store.set('nucleus-queue', queue)

	// If nothing to report no need to reopen connection if in main process
	// Except if we only report from main process
	if (!queue.length && !gotInitted) return

	if (trackingOff) return


	// If socket was closed for whatever reason re-open it
	if (!ws || ws.readyState !== WebSocket.OPEN) {

		log('No connection to server. Opening it.')

		ws = new WebSocket(`${ endpoint }/app/${ localData.appId }/track`)

		ws.onerror = (e) => {
			logError(`ws ${e.code}: ${e.reason}`)
		}

		ws.onclose = (e) => {
			logError(`ws ${e.code}: ${e.reason}`)
		}

		ws.onmessage = messageFromServer

		ws.onopen = sendQueue
	}

	if (queue.length) sendQueue()
}

const messageFromServer = (message) => {

	let data = {}

	log('server said '+message.data)

	try {
		data = JSON.parse(message.data)
	} catch (e) {
		logError('Could not parse message from server.')
		return
	}

	if (data.customData) {
		// Cache (or update cache) the custom data
		cache.customData = data.customData
		debounce(() => store.set('nucleus-cache', cache))
	}

	if (data.latestVersion) {
		// Get the app's latest version
		latestVersion = data.latestVersion

		Nucleus.checkUpdates()
	}

	if (data.reportedIds || data.confirmation) {
		// Data was successfully reported, we can empty the queue
		log('Server successfully registered our data.')

		if (data.reportedIds) queue = queue.filter(e => !data.reportedIds.includes(e.id))
		else if (data.confirmation) queue = [] // Legacy handling

		debounce(() => store.set('nucleus-queue', queue))
	}

}

const log = (message) => {
	if (debug) console.log('Nucleus:', message)
}

const logError = (message) => {
	if (debug) console.warn('Nucleus Error:', message)
}

const autoDetectData = () => {

	/* Try to find version with Electron */
	try {
		const { remote, app } = require('electron')
		const electronApp = remote ? remote.app : app // Depends on process

		localData.version = isDevMode() ? '0.0.0' : electronApp.getVersion()
	} catch (e) {
		log("Looks like it's not an Electron app.")
		// Electron not available
	}

	/* Try to find OS stuff */
	/* And fallback to browser info else */
	try {
	
		const os = require('os')
		localData.platform 	= os.type()
		localData.osVersion = os.release()
		localData.totalRam 	= os.totalmem() / Math.pow(1024, 3)
		localData.locale 	= require('os-locale').sync()
		localData.machineId = require('node-machine-id').machineIdSync()
	
	} catch (e) {

		log("Looks like Node is not available. Let's try without.")

		if (typeof navigator !== 'undefined') {
			const osInfo = getNavigatorOS()
 
			localData.platform 	= osInfo.name
			localData.osVersion = osInfo.version
			localData.locale 	= navigator.language
			localData.totalRam 	= navigator.deviceMemory
		}
	}

	let undetectedProps = Object.keys(localData).filter(prop => !localData[prop])

	if (undetectedProps.length) {
		logError(`Some properties couldn't be autodetected: ${undetectedProps.join(',')}. Set them manually or data will be missing in the dashboard.`)
	}

}

module.exports = Nucleus
