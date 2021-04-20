const { app, Menu } = require('electron');
const { join } = require('path');
const Splashscreen = require('@trodi/electron-splashscreen');

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
	global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\');
}

let mainWindow;
const winURL = process.env.NODE_ENV === 'development'
	? `http://localhost:9080`
	: join('file://', __dirname, '/index.html');

function createWindow() {
	/**
	 * Initial window options
	 */
	const mainOptions = {
		height: 720,
		useContentSize: true,
		show: false,
		width: 1280,
		frame: false,
		titleBarStyle: 'hiddenInset',
		webPreferences: {
			nodeIntegration: true,
			enableRemoteModule: true
		}
	};
	const config = {
		windowOpts: mainOptions,
		templateUrl: join(__static, '/splash-screen.svg'),
		delay: 0, // force show immediately since example will load fast
		minVisible: 1500, // show for 1.5s so example is obvious
		splashScreenOpts: {
			height: 200,
			width: 1000,
			transparent: true,
			webPreferences: {
				devTools: false
			}
		}
	};

	mainWindow = Splashscreen.initSplashScreen(config);

	mainWindow.loadURL(winURL);

	mainWindow.on('closed', () => {
		mainWindow = null;
	});
	// Create the Application's main menu
	const template = [{
		label: 'Application',
		submenu: [
			{ label: 'About Application', selector: 'orderFrontStandardAboutPanel:' },
			{ type: 'separator' },
			{
				label: 'Quit', accelerator: 'Command+Q', click: function() {
					app.quit();
				}
			}
		]
	}, {
		label: 'Edit',
		submenu: [
			{ label: 'Undo', accelerator: 'CmdOrCtrl+Z', selector: 'undo:' },
			{ label: 'Redo', accelerator: 'Shift+CmdOrCtrl+Z', selector: 'redo:' },
			{ type: 'separator' },
			{ label: 'Cut', accelerator: 'CmdOrCtrl+X', selector: 'cut:' },
			{ label: 'Copy', accelerator: 'CmdOrCtrl+C', selector: 'copy:' },
			{ label: 'Paste', accelerator: 'CmdOrCtrl+V', selector: 'paste:' },
			{ label: 'Select All', accelerator: 'CmdOrCtrl+A', selector: 'selectAll:' }
		]
	}
	];
	Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

app.whenReady().then(() => {
	createWindow();
});

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', () => {
	if (mainWindow === null) {
		createWindow();
	}
});

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
