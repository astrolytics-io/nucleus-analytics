# electron-nucleus
Analytics made simple for Electron using [Nucleus](https://nucleus.sh).

This module is working on the renderer process.

To start using this module you need to sign up and get an app id on the [Nucleus website](https://nucleus.sh). 


## Installation

Using npm:

```bash
$ npm install electron-nucleus --save
```


## Usage

In your renderer process add the following script:  

```javascript
const Nucleus = require("electron-nucleus")

Nucleus.init("<Your App Id>")
```
You can sign up and get an ID for your app [here](https://nucleus.sh).<br><br>



## Development Mode
If you want to track data during development, add *true* as the second argument of the init method.

```
Nucleus.init("<Your App Id>", true)
```
**Note** : when running in development, depending on your env setup and location of the electron module, the app name and version can vary.



### Custom Events

After initializing **Nucleus**, you can send your own custom events.<br>

```javascript
Nucleus.track("PLAYED_TRACK")
```

Contact **hello@nucleus.sh** for any inquiry