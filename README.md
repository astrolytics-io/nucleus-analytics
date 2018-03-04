# electron-nucleus [![npm](https://img.shields.io/npm/v/electron-nucleus.svg)](https://www.npmjs.com/package/electron-nucleus)
Analytics, licensing and crash reports made simple for Electron using [Nucleus](https://nucleus.sh).

To start using this module you need to sign up and get an app id on the [Nucleus website](https://nucleus.sh). 

This module is mainly working on the renderer process, but needs to be initiated in the main process for crash reports.


## Installation

Using npm:

```bash
$ npm install electron-nucleus --save
```


## Usage

In *both* renderer and main process add the following script:  
If you don't add it to the main process, it won't be able to report crashes.


```javascript
const Nucleus = require("electron-nucleus")("<Your App Id>")

```
You can sign up and get an ID for your app [here](https://nucleus.sh).


### Development Mode

If you want to track data during development, add *true* as the second argument of the init method.

```javascript
const Nucleus = require("electron-nucleus")("<Your App Id>", true)
```
**Note** : when running in development, depending on your env setup and location of the electron module, the app name and version can vary.


### Events

After initializing Nucleus, you can send your own custom events.

```javascript
Nucleus.track("PLAYED_TRACK")
```

They are a couple events that are reserved by Nucleus:
`init`, `windowError`, `uncaughtException` and `unhandledRejection`

You can't report these events.

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

Nucleus will report all `uncaughtException` and `unhandledRejection`.

If you'd like to act on these errors, for example show them to your user, quit the app or reload it, you can define an onError function, which will be called on errors happening on the respective process.


```javascript
Nucleus.onError = (err, type) => {
	console.error(err)
	// type will either be uncaughtException, unhandledRejection or windowError
}
```


`windowError` is an `uncaughtException` that happened in the rendered process. It was catched with `window.onerror`.


### Updates

If Nucleus detects that the user is running a version inferior to the one set in your app settings, it can call a function so you can alert the user (or something else).


```javascript
Nucleus.onUpdate = (lastVersion) => {
	alert('New version available: ' + lastVersion)
}
```


### Custom metrics

Coming soon.

---
Contact **hello@nucleus.sh** for any inquiry