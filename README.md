# nodejs-nucleus [![npm](https://img.shields.io/npm/v/nodejs-nucleus.svg)](https://www.npmjs.com/package/nodejs-nucleus)

Analytics, licensing and bug reports for Node.js, Electron and NW.js desktop applications.

We made it as simple as possible to report the data you need to analyze your app and improve it.

To start using this module, sign up and get an app ID on [Nucleus.sh](https://nucleus.sh). 

<b>Electron:</b>

This module works in both the renderer and the main process. 
However be sure to only call the `appStarted()` method once per session (in only one process) or you'll find duplicate data in the dashboard.

This module can even run in a browser outside of Node (for example in the Electron renderer process with Node Integration disabled).

<!--
# 3.0.0 Breaking changes:

The version 3 of the module introce breaking changes, so be careful to update your integration before upgrading.

- You now have to manually call the `init` and `appStarted` methods to start the analaytics session. This was because the previous way was confusing between processes.
- The module is now 100% independent from Node and can run in an isolated browser context
- Options were renamed 
-->

## Installation

Using npm:

```bash
$ npm install nodejs-nucleus --save
```

## Usage

Sign up and get a tracking ID for your app [here](https://nucleus.sh).

Call the appStarted method *only one time* per session.

You only need to call `init` once per process.

If you use the module in both the main and renderer process, make sure that you only call `appStarted` once.

```javascript
const Nucleus = require("nodejs-nucleus")

Nucleus.init("<Your App Id>")

// Optional: sets an user ID
Nucleus.setUserId('richard_hendrix')

// Required: Sends the first event to the server that app started
Nucleus.appStarted()

// Report things
Nucleus.track("PLAYED_TRACK", {
	trackName: 'My Awesome Song',
	duration: 120
})
```

### Options

You can init Nucleus with options:

```javascript
const Nucleus = require("nodejs-nucleus")

Nucleus.init("<Your App Id>", {
	disableInDev: false, // disable module while in development (default: false)
	disableTracking: false, // completely disable tracking
	disableErrorReports: false, // disable errors reporting (default: false)
	autoUserId: false, // auto assign the user an id: username@hostname
	persist: false, // cache events to disk if offline to report later
	debug: true // Show logs
})

Nucleus.appStarted()
```

**Each property is optional**. You can start using the module with just the app ID.

The module will try to autodetect a maximum of data as possible but some can fail to detect (especially if in a Browser outside of Node).

It will tell you in the logs (if you set `debug: true`) which one failed to detect.

You can also change the data, if you make sure to do it before the `appStarted` method.

```javascript
Nucleus.setProps({
	version: '0.3.1',
	language: 'fr'
	// ...
})

Nucleus.appStarted()
```

**Note** : when running in development, the app version will be '0.0.0'

### Identify your users

You can track specific users actions on the 'User Explorer' section of your dashboard.

For that, you can supply an `userId` when initing the Nucleus module. 

It can be your own generated ID, an email, username... etc.

```javascript
Nucleus.setProps({
	userId: 'someUniqueUserId'
})
```

Or:

```javascript
Nucleus.setUserId('someUniqueUserId')
```

Alternatively, set the `autoUserId` option of the module to `true` to assign the user an ID based on his username and hostname.


### Add properties

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

```javascript
Nucleus.setProps({
	age: 23
}, true)
```

### Events

After initializing Nucleus, you can send your own custom events.

```javascript
Nucleus.track("PLAYED_TRACK")
```

They are a couple event names that are reserved by Nucleus: `init`, `error:` and `nucleus:`. Don't report events containing these strings.

#### Attach more data

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

---
Contact **hello@nucleus.sh** for any inquiry
