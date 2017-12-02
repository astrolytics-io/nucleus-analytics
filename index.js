'use strict';

const {remote} = require('electron')
const request = require('request')

const userId = require('node-machine-id').machineIdSync()
const platform = process.platform.replace("darwin", "mac")
const version = remote.app.getVersion()
const language = (navigator.language || navigator.userLanguage).substring(0,2)
let newUser = false

const Store = require('electron-store')
const store = new Store()

// Taken from sindresorhus/electron-is-dev, thanks to the author
const getFromEnv = parseInt(process.env.ELECTRON_IS_DEV, 10) === 1
const isEnvSet = 'ELECTRON_IS_DEV' in process.env
const devModeEnabled = isEnvSet ? getFromEnv : (process.defaultApp || /node_modules[\\/]electron[\\/]/.test(process.execPath))
//

const serverUrl = "https://nucleus.sh/track/"

let appId = ""
let queue = []

let useInDev = false

if (store.has('queue')) queue = store.get('queue')
else newUser = true

module.exports = {

	init: (app, dev) => {
		useInDev = dev

		if (app && (!devModeEnabled || useInDev)) {

			appId = app

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

		}

	},

	track: (eventName) => {

		if (eventName && (!devModeEnabled || useInDev)) {

			queue.push({
				event: eventName,
				date: new Date().toISOString().slice(0, 10),
				userId: userId
			})

			store.set('queue', queue)

			reportData()

		}

	},

	checkLicense: (license) => {

	}
}

window.addEventListener('online', () => {
	reportData()
})

function reportData() {
	if (queue.length) {
		request({ url: serverUrl+appId, method: 'POST', json: {data: queue} }, (err, res, body) => {

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