const { app, BrowserWindow } = require('electron')

function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  })

  // Esto le dice a Electron que cargue lo que ves en el navegador
  win.loadURL('http://localhost:3000') 
}

app.whenReady().then(createWindow)