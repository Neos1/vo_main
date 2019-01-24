
const {app, BrowserWindow, globalShortcut} = require('electron');
const electronLocalshortcut = require('electron-localshortcut');


const path = require('path');
const url = require('url');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({width: 900, height: 680});
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