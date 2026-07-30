import { app, BrowserWindow, dialog, ipcMain, Menu } from 'electron';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string | undefined;
declare const MAIN_WINDOW_VITE_NAME: string;

let mainWindow: BrowserWindow | null = null;
let splashWindow: BrowserWindow | null = null;
let splashShownAt = 0;
let splashReady: Promise<void> = Promise.resolve();
const MIN_SPLASH_VISIBLE_MS = 1500;

function createSplashWindow(): void {
  splashWindow = new BrowserWindow({
    width: 984,
    height: 182,
    show: false,
    frame: false,
    transparent: true,
    resizable: false,
    movable: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      devTools: false
    }
  });

  const splashPath = app.isPackaged
    ? path.join(process.resourcesPath, 'static/splash-screen.html')
    : path.join(app.getAppPath(), 'static/splash-screen.html');

  splashReady = splashWindow
    .loadFile(splashPath)
    .then(() => {
      if (!splashWindow || splashWindow.isDestroyed()) return;
      splashShownAt = Date.now();
      splashWindow.show();
    })
    .catch(() => {
      splashWindow?.destroy();
      splashWindow = null;
    });
}

function revealMainWindow(): void {
  void splashReady.finally(() => {
    const remainingSplashTime = splashShownAt
      ? Math.max(0, MIN_SPLASH_VISIBLE_MS - (Date.now() - splashShownAt))
      : 0;
    setTimeout(() => {
      if (mainWindow && !mainWindow.isDestroyed()) mainWindow.show();
      if (splashWindow && !splashWindow.isDestroyed()) splashWindow.close();
      splashWindow = null;
    }, remainingSplashTime);
  });
}

function createWindow(): void {
  createSplashWindow();
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    minWidth: 960,
    minHeight: 600,
    show: false,
    backgroundColor: '#f7f8fa',
    title: 'Meteorman',
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  const mainWindowReady = MAIN_WINDOW_VITE_DEV_SERVER_URL
    ? mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL)
    : mainWindow.loadFile(
        path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
      );

  void mainWindowReady.then(revealMainWindow).catch((error: unknown) => {
    console.error('Failed to load the Meteorman renderer', error);
    if (mainWindow && !mainWindow.isDestroyed()) mainWindow.show();
    if (splashWindow && !splashWindow.isDestroyed()) splashWindow.close();
    splashWindow = null;
  });
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function registerIpc(): void {
  ipcMain.handle('state:read-legacy', async () => {
    try {
      const content = await readFile(path.join(app.getPath('userData'), 'vuex.json'), 'utf8');
      const legacy = JSON.parse(content) as { state?: unknown };
      return legacy.state ?? null;
    } catch {
      return null;
    }
  });

  ipcMain.handle('collections:import', async () => {
    if (!mainWindow) return [];

    const selection = await dialog.showOpenDialog(mainWindow, {
      title: 'Import Meteorman collections',
      properties: ['openFile', 'multiSelections'],
      filters: [{ name: 'JSON', extensions: ['json'] }]
    });

    if (selection.canceled) return [];

    return Promise.all(
      selection.filePaths.map(async (filePath) => ({
        name: path.basename(filePath),
        content: await readFile(filePath, 'utf8')
      }))
    );
  });

  ipcMain.handle(
    'collections:export',
    async (_event, suggestedName: string, content: string) => {
      if (!mainWindow) return false;

      const selection = await dialog.showSaveDialog(mainWindow, {
        title: 'Export Meteorman collection',
        defaultPath: `${suggestedName}.json`,
        filters: [{ name: 'JSON', extensions: ['json'] }]
      });

      if (selection.canceled || !selection.filePath) return false;
      await writeFile(selection.filePath, content, 'utf8');
      return true;
    }
  );
}

const menu = Menu.buildFromTemplate([
  {
    label: app.name,
    submenu: [
      { role: 'about' },
      { type: 'separator' },
      { role: 'services' },
      { type: 'separator' },
      { role: 'hide' },
      { role: 'hideOthers' },
      { role: 'unhide' },
      { type: 'separator' },
      { role: 'quit' }
    ]
  },
  {
    label: 'Edit',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      { role: 'selectAll' }
    ]
  },
  {
    label: 'View',
    submenu: [
      { role: 'reload' },
      { role: 'forceReload' },
      { role: 'toggleDevTools' },
      { type: 'separator' },
      { role: 'resetZoom' },
      { role: 'zoomIn' },
      { role: 'zoomOut' },
      { type: 'separator' },
      { role: 'togglefullscreen' }
    ]
  }
]);

app.whenReady().then(() => {
  registerIpc();
  Menu.setApplicationMenu(menu);
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
