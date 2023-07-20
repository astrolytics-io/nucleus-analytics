# nucleus-analytics [![npm](https://img.shields.io/npm/v/nucleus-analytics.svg)](https://www.npmjs.com/package/nucleus-analytics)

To start using this module, sign up and get an app ID on [Nucleus.sh](https://nucleus.sh).

This module works in both the renderer and the main process, but **you should use it in one process only, otherwise you'll see duplicate data. For maximum data accuracy, we recommend the renderer process.**

## V4.0 breaking changes
- the `.appStarted()` method has been removed and integrated into .init()
- anonymous users are automatically tracked
- user sessions now expire after 30 mins of inactivity
- on Electron, the module is now made to be used in 1 process only (renderer recommended)
- The device ID is now different between computer user sessions (existing users will count as new users on the dashboard)
- `.screen()` has been replaced by `.page()` (but is still available as an alias)
- the "autoUserId" option has been removed
- the deprecated `.checkUpdates()` method has been removed
- events are throttled to 20/s maximum
- stopped tracking device ram and arch

## Installation

Using npm or yarn (recommended):

```bash
$ npm install nucleus-analytics
$ yarn add nucleus-analytics
```

## Usage

First sign-up and get a tracking ID for your app [here](https://nucleus.sh).

With ES6 imports:

```javascript
import Nucleus from "nucleus-analytics"
```

Or with CommonJS imports:

```javascript
const Nucleus = require('nucleus-analytics')
```

Then:

```javascript
Nucleus.init("<Your App Id>")

// Optional: sets an user ID
Nucleus.setUserId("richard_hendrix")

// Report things
Nucleus.track("PLAYED_TRACK", {
  trackName: "My Awesome Song",
  duration: 120,
})
```

You only need to call `init` once.

### Options

You can init Nucleus with options:

```javascript
import Nucleus from "nucleus-analytics"

Nucleus.init("<Your App Id>", {
  disableInDev: false, // disable module while in development (default: false)
  disableTracking: false, // completely disable tracking from the start (default: false)
  disableErrorReports: false, // disable errors reporting (default: false)
  sessionTimeout: 60 * 60, // in seconds, after how much inactivity a session expires
  useOldDeviceId: false, // use the legacy device ID (default: false)
  debug: true, // Show logs
})

```

**Each property is optional**. You can start using the module with just the app ID.

The module will try to autodetect a maximum of data as possible but some can fail to detect.
It will tell you in the logs which one it failed to detect.

You can manually add data:

```javascript
Nucleus.setProps({
  version: "0.3.1",
  locale: "fr",
  // ...
})
```

### Electron Version detection

Version detection only works on Electron's main process as newest Electron versions don't supply the remote module version.

To get the version programmatically in Electron's renderer process you need to [setup the remote object](https://github.com/electron/remote), you can then track the version with:


```javascript
const { app } = require('@electron/remote')

Nucleus.setProps({
  version: app.getVersion(),
})
```

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

Overwrite past properties by setting the second parameter as true.

```javascript
Nucleus.setProps({
  age: 23
}, true)
```

### Events

Send your own events and track user actions:

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

For that, whenever the user navigates to a different page, call the `.page()` method with the new view name.

```javascript
Nucleus.page("View Name")
```

You can attach extra info about the view. Example:

```javascript
Nucleus.page("Cart", {
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

### Error tracking

Nucleus will by default report all `uncaughtException`, `unhandledRejection` and `windowError` events.

If you'd like to report another type of error, you can do so with:

```javascript
Nucleus.trackError("myCustomError", err)
```

Contact **hello@nucleus.sh** for any inquiry
