# nucleus-analytics [![npm](https://img.shields.io/npm/v/nucleus-analytics.svg)](https://www.npmjs.com/package/nucleus-analytics)

Isomorphic analytics and bug tracking for browser, Node.js, Electron and NW.js desktop applications.

We made it as simple as possible to report the data you need to analyze your app and improve it.

To start using this module, sign up and get an app ID on [Nucleus.sh](https://nucleus.sh).

<b>Electron:</b>

This module works in both the renderer and the main process, but **you should use it in one process only, optherwise you'll see duplicated data.**


This module can even run in a browser outside of Node (for example in the Electron renderer process with Node Integration disabled).

## V4.0 breaking changes
- the .appStarted() method has been removed and integrated into .init()
- on Electron, the module is now made to be used in 1 process only (renderer recommended)
- .screen() has been replaced by .page()
- the module is now fully compatible with browser environments
- the "autoUserId" option has been removed
- the deprecated .checkUpdates() method has been removed

## Installation

Using npm:

```bash
$ npm install nucleus-analytics --save
```

In the browser:

```
<scripts src="https://cdn.jsdelivr.net/gh/nucleus-sh/nucleus-javascript@browser-support/dist/index.min.js"></script>

<script>
Nucleus.init("<Your App Id>")
</script>

```

## Usage

Sign up and get a tracking ID for your app [here](https://nucleus.sh).

You only need to call `init` once per process.


```javascript
import Nucleus from "nucleus-analytics"

Nucleus.init("<Your App Id>")

// Optional: sets an user ID
Nucleus.setUserId("richard_hendrix")

// Report things
Nucleus.track("PLAYED_TRACK", {
  trackName: "My Awesome Song",
  duration: 120,
})
```

### Options

You can init Nucleus with options:

```javascript
import Nucleus from "nucleus-analytics"

Nucleus.init("<Your App Id>", {
  disableInDev: false, // disable module while in development (default: false)
  disableTracking: false, // completely disable tracking from the start (default: false)
  disableErrorReports: false, // disable errors reporting (default: false)
  debug: true, // Show logs
})

Nucleus.appStarted()
```

**Each property is optional**. You can start using the module with just the app ID.

The module will try to autodetect a maximum of data as possible but some can fail to detect.

It will tell you in the logs (if you set `debug: true`) which one it failed to detect.

You can also change the data:

```javascript
Nucleus.setProps({
  version: "0.3.1",
  language: "fr",
  // ...
})
```

**Note** : when running in development, the app version will be '0.0.0'

### Identify your users

You can track specific users actions on the 'User Explorer' section of your dashboard.

For that, you need to supply an `userId`, a string that will allow you to track your users.

It can be your own generated ID, an email, username... etc.

```javascript
Nucleus.identify("someUniqueUserId")
```

You can also pass custom attributes to be reported along with it.

```javascript
Nucleus.identify("someUniqueUserId", {
  age: 34,
  name: "Richard Hendricks",
  jobType: "CEO",
})
```

If you call `.identify()` multiple times, the last one will be remembered as the current user data (it will overwrite).

Later on, you can update the userId only (and keep the attributes) with this method:

```javascript
Nucleus.setUserId("someUniqueUserId")
```

Alternatively, set the `autoUserId` option of the module to `true` to automatically assign the user an ID based on his username and hostname.

### Update user attributes

You can report custom user attributes along with the automatic data.

Those will be visible in your user dashboard if you previously set an user ID.

The module will remember past properties so you can use `Nucleus.setProps` multiple times without overwriting past props.

Properties can either **numbers**, **strings** or **booleans**.
Nested properties or arrays aren't supported at the moment.

```javascript
Nucleus.setProps({
  age: 34,
  name: "Richard Hendricks",
  jobType: "CEO",
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

#### Attach custom data

You can also add extra information to tracked events, as a JSON object.

Properties can either **numbers**, **strings** or **booleans**.
Nested properties or arrays aren't supported at the moment (they won't show in the dashboard).

Example

```javascript
Nucleus.track("PLAYED_TRACK", {
  trackName: "My Awesome Song",
  duration: 120,
})
```

#### Pages and Screen Views (beta)

You can set up Nucleus to track page visits and screen views in your app.

For that, whenever the user navigates to a different page, call the `.screen()` method with the new view name.

```javascript
Nucleus.screen("View Name")
```

You can attach extra info about the view. Example: 

```javascript
Nucleus.screen("Cart", {
  action: "addItem",
  count: 5
})
```

Params can either be **numbers**, **strings** or **booleans**.
Nested params or arrays aren't supported at the moment (they won't show in the dashboard).

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
Nucleus.onError = (type, err) => {
  console.error(err)
  // type will either be uncaughtException, unhandledRejection or windowError
}
```

`windowError` is an `uncaughtException` that happened in the renderer process. It was catched with `window.onerror`.

If you'd like to report another type of error, you can do so with:

```javascript
Nucleus.trackError("myCustomError", err)
```

Contact **hello@nucleus.sh** for any inquiry
