const {app, BrowserWindow, globalShortcut} = require('electron');
const electronLocalshortcut = require('electron-localshortcut');


const path = require('path');
const url = require('url');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    useContentSize:true,
    minWidth:960,
    minHeight:560,
    width: 960,
    height: 560
  });
  mainWindow.loadURL(`file://${path.join(__dirname, './build/ballot/index.html')}`);
  mainWindow.on('closed', () => mainWindow = null);
  electronLocalshortcut.register(mainWindow, 'F12', () => {
    mainWindow.webContents.toggleDevTools()
  });
}

app.on('ready',createWindow);

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