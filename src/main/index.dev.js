/**
 * This file is used specifically and only for development. It installs
 * `electron-debug` & `vue-devtools`. There shouldn't be any need to
 *  modify this file, but it can be used to extend your development
 *  environment.
 */

const { app } = require('electron')

// Install `electron-debug` with `devtron`
require('electron-debug')({ showDevTools: true })

// Install `vue-devtools`
app.whenReady().then(() => {
    require('devtron').install()

    const installExtension = require('electron-devtools-installer')
    installExtension.default(installExtension.VUEJS_DEVTOOLS, {
        loadExtensionOptions: { allowFileAccess: true },
        forceDownload: false
    })
        .then(name => console.log(`Added Extension: ${name}`))
        .catch(err => {
            console.log('Unable to install `vue-devtools`: \n', err)
        })
})

// Require `main` process to boot app
require('./index')
