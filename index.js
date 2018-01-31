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

let ws = null // Used later on for global access
let wsConfirmation = null
let newUser = false
let useInDev = false
let appId = null
let queue = []


const apiUrl = "nucleus.sh"
//const apiUrl = "localhost:5000"


if (store.has('queue')) queue = store.get('queue')
else newUser = true


module.exports = (app, dev) => {

	let module = {}

	module.init = (app, dev) => {
		useInDev = dev

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
				date: new Date().toISOString().slice(0, 10),
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
				date: new Date().toISOString().slice(0, 10),
				userId: machineId
			})

			store.set('queue', queue)

			reportData()

		}

	}

	module.checkLicense = (license, callback) => {

		if (!license) return
			
		let data = {
			key: license,
			machineId: machineId,
			platform: platform,
			version: version
		}

		request({ url: `https://${apiUrl}/app/${appId}/license/validate`, method: 'POST', json: {data: data} }, (err, res, body) => {

			callback(err, body)

		})
	}


	if (app) module.init(app, dev) // So it inits if we directly pass the app id

	return module

}


// Try to report the data to the server

function reportData() {

	function send() {
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
			ws = new WebSocket(`ws://${apiUrl}/app/${appId}/track`)

			// We are going to need to open this later
			ws.on('error', (err) => ws = null)
			ws.on('close', () => ws = null)

			ws.on('open', send )

			ws.on('message', (confirmation) => {

				if (confirmation === wsConfirmation) {
					// Data was successfully reported

					queue = []

					store.set('queue', queue)
				}

			})
				

		} else {
			send()
		}

	}
}