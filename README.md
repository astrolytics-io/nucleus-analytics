# electron-nucleus [![npm](https://img.shields.io/npm/v/electron-nucleus.svg)](https://www.npmjs.com/package/electron-nucleus)
Analytics, licensing and bug reports for Electron using [Nucleus](https://nucleus.sh).

We tried to make it as simple as possible to report the data you need to analyze your app and improve it.

To start using this module, sign up and get an app ID on the [Nucleus website](https://nucleus.sh). 

This module is mainly working on the renderer process. It should still be initiated in the main process for catching all errors (or reporting events inside it). However, if you only have access to the main process you can still use Nucleus as explained below.


## Installation

Using npm:

```bash
$ npm install electron-nucleus --save
```

## Usage

Add the following code to import Nucleus **in the renderer process**:


```javascript
const Nucleus = require("electron-nucleus")("<Your App Id>")
```

Also add it to the main process if you need to report events from there.

If you are only able to use Nucleus in the main process, you should set the `onlyMainProcess` option:

```javascript
const Nucleus = require("electron-nucleus")("<Your App Id>", { onlyMainProcess: true })
```

Sign up and get a tracking ID for your app [here](https://nucleus.sh).


### Options

You can init Nucleus with options:

```javascript
const Nucleus = require("electron-nucleus")("<Your App Id>", {
	disableInDev: false, // disable module while in development (default: false)
	disableTracking: false, // completely disable tracking
	onlyMainProcess: false, // if you can only use Nucleus in the mainprocess
	disableErrorReports: false, // disable errors reporting (default: false)
	autoUserId: false, // auto gives the user an id: username@hostname
	userId: 'user@email.com', // set an identifier for this user
	persist: false, // cache events to disk if offline to report later
	version: '1.3.9', // set a custom version for your app (default: autodetected)
	language: 'es' // specify a custom language (default: autodetected)
})
```

By default **version**, **language** and **country** are autodetected but you can overwrite them.

Where options is an object, **each property is optional**. You can start using the module with just the app ID.

**Note** : when running in development, the app version will be '0.0.0'

### Track custom data

You can report custom data along with the automatic data.
 
Those will be visible in your user dashboard if you previously set an user ID.

The module will remember past properties so you can use `Nucleus.setProps` multiple times without overwriting past props.

Properties can either **numbers**, **strings** or **booleans**. 
Nested properties or arrays aren't supported at the moment.

```javascript
Nucleus.setProps({
	age: 34,
	name: 'Richard Hendricks',
	jobType: 'CEO'
})
```

Enable overwrite: set the second parameter as true to overwrite past properties. 

```
Nucleus.setProps({
	age: 23
}, true)
```

### Events

After initializing Nucleus, you can send your own custom events.

```javascript
Nucleus.track("PLAYED_TRACK")
```

They are a couple events that are reserved by Nucleus: `init`, `error:` and `nucleus:`. You shouldn't report events containing these strings.

#### Tracking with data

You can also add extra information to tracked events, as a JSON object.

Properties can either **numbers**, **strings** or **booleans**. 
Nested properties or arrays aren't supported at the moment.

Example

```javascript
Nucleus.track("PLAYED_TRACK", {
	trackName: 'My Awesome Song',
	duration: 120
})
```

### Toggle tracking

This will completely disable any communication with Nucleus' servers.

To opt-out your users from tracking, use the following methods:

```javascript
Nucleus.disableTracking()
```

and to opt back in:

```javascript
Nucleus.enableTracking()
```

This change won't persist after restarts so you have to handle the saving of the settings.

You can also supply a `disableTracking: true` option to the module on start if you want to directly prevent tracking.


### Identify your users

You can track specific users actions on the 'User Explorer' section of your dashboard.

For that, you can supply an `userId` when initing the Nucleus module. 

It can be your own generated ID, an email, username... etc.

```javascript
const Nucleus = require("electron-nucleus")("<Your App Id>", {
	userId: 'someUniqueUserId'
})
```

Or if you don't know it on start, you can add it later with:

```javascript
Nucleus.setUserId('someUniqueUserId')
```

Alternatively, set the `autoUserId` option of the module to `true`  to automatically assign the user an ID based on his username and hostname.

### Errors

Nucleus will by default report all `uncaughtException` and `unhandledRejection`.

If you'd like to act on these errors, for example show them to your user, quit the app or reload it, you can define an onError function, which will be called on errors happening on the respective process.


```javascript
Nucleus.onError = (type, err) => {
	console.error(err)
	// type will either be uncaughtException, unhandledRejection or windowError
}
```


`windowError` is an `uncaughtException` that happened in the renderer process. It was catched with `window.onerror`.

If you'd like to report another type of error, you can do so with:

```javascript
Nucleus.trackError('myCustomError', err)
```

### Updates

If the user is running a version inferior to the one set in your app settings (account section in the dashboard), it can call a function so you can alert the user (or something else).

If there's an update, the function will be called when starting the app.


```javascript
Nucleus.onUpdate = (lastVersion) => {
	alert('New version available: ' + lastVersion)
}
```

**Note** : when running in development, the app version will be '0.0.0', so you can test this by setting a higher version in your dashboard

### License checking (legacy)

You can check if a license (created via Nucleus's API) is valid with the following code:


```javascript
Nucleus.checkLicense('SOME_LICENSE', (err, license) => {
	if (err) return console.error(err)

	if (license.valid) {
		console.log('License is valid :) Using policy '+license.policy)
	} else {
		console.log('License is invalid :(')
	}
})
```

---
Contact **hello@nucleus.sh** for any inquiry
