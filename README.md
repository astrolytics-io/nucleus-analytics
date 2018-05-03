# electron-nucleus [![npm](https://img.shields.io/npm/v/electron-nucleus.svg)](https://www.npmjs.com/package/electron-nucleus)
Analytics, licensing and bug reports made simple for Electron using [Nucleus](https://nucleus.sh).

To start using this module you need to sign up and get an app id on the [Nucleus website](https://nucleus.sh). 

This module is mainly working on the renderer process, but needs to be initiated in the main process for crash reports.


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

Also add it to the main process to make sure all crashes are reported.

You can sign up and get an ID for your app [here](https://nucleus.sh).


### Options

You can init Nucleus with options:

```javascript
const Nucleus = require("electron-nucleus")("<Your App Id>", {
	disableInDev: false, // disable module while in development (default: false)
	userId: 'user@email.com', // Set a custom identifier for this User
	version: '1.3.9', // Set a custom version
	language: 'es', // Set a custom language
	disableErrorReports: false // disable errors reporting (default: false)
})
```

Where options is an object, **where each property is optional**.

**Note** : when running in development, the app version will be '0.0.0'


### Events

After initializing Nucleus, you can send your own custom events.

```javascript
Nucleus.track("PLAYED_TRACK")
```

They are a couple events that are reserved by Nucleus: `init`, `error:*` . You can't report events containing these strings.

### License checking

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

### Errors

Nucleus will by default report all `uncaughtException`, `unhandledRejection` and crashes using Electron's crash reporter.

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
Nucleus.trackError('weirdError', err)
```

### Track specific users

You can track specific users actions on the 'User Explorer' section of your dashboard.
For that, you can supply an `userId` when initing the Nucleus module:

```javascript
const Nucleus = require("electron-nucleus")("<Your App Id>", {
	userId: 'someUniqueUserId'
})
```

or, if you don't know it on start, you can add it later with:

```javascript
Nucleus.setUserId('someUniqueUserId')
```

/!\ Be defining the user id after requiring Nucleus, the 'init' event (used to track app start)  won't be associated to your userId and the data about actual usage per user can differ.

### Updates

If the user is running a version inferior to the one set in your app settings (account section in the dashboard), it can call a function so you can alert the user (or something else).


```javascript
Nucleus.onUpdate = (lastVersion) => {
	alert('New version available: ' + lastVersion)
}
```

**Note** : when running in development, the app version will be '0.0.0', so you can test this by setting a higher version in your dashboard


---
Contact **hello@nucleus.sh** for any inquiry