
const {app, BrowserWindow, globalShortcut} = require('electron');
const electronLocalshortcut = require('electron-localshortcut');


const path = require('path');
const url = require('url');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    useContentSize:true,
    minWidth:1280,
    minHeight:720,
    width: 1280,
    height: 720
  });
  mainWindow.loadURL('http://localhost:8080');
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