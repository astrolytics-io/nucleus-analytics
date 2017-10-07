'use strict';

const {remote} = require('electron')
const request = require('request')

const userId = require('node-machine-id').machineIdSync()
const platform = process.platform.replace("darwin", "mac")
const version = remote.app.getVersion()
const language = navigator.language
let newUser = false

const Store = require('electron-store')
const store = new Store()

// Taken from sindresorhus/electron-is-dev, thanks to the author
const getFromEnv = parseInt(process.env.ELECTRON_IS_DEV, 10) === 1
const isEnvSet = 'ELECTRON_IS_DEV' in process.env
const devModeEnabled = isEnvSet ? getFromEnv : (process.defaultApp || /node_modules[\\/]electron[\\/]/.test(process.execPath))
//

const serverUrl = "https://localhost:5000/track"

let appId = ""
let queue = []

if (store.has('queue')) queue = store.get('queue')
else newUser = true

module.exports = {

	init: function(appId, useInDev) {

		if (appId && (!devModeEnabled || useInDev)) {

			appId = appId

			queue.push({
				event: 'init',
				date: new Date(),
				user: userId,
				platform: platform,
				version: version,
				language: language,
				newUser: newUser
			})

			store.set('queue', queue)

			reportData()

		}

	},

	track: function(eventName) {

		if (eventName && !devModeEnabled) {

			queue.push({
				event: eventName,
				date: new Date(),
				user: userId
			})

			store.set('queue', queue)

			reportData()

		}

	},

	checkLicense: function(license) {

	}
}

window.addEventListener('online', () => {
	reportData()
})

function reportData() {
	if (queue.length) {
		request({ url: serverUrl+'/'+appId, method: 'POST', json: {data: queue} }, function (err, res, body) {
			console.log(err, body)

			if (err) {
				// No internet or error with server
				// Data will be sent with next request

			} else {
				// Data was successfully reported

				queued = []

				store.set('queue', queue)

			}

		})
	}
}