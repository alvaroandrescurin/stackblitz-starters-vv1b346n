const { app, BrowserWindow } = require('electron')
const path = require('path')

function createWindow () {
  const win = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  // TRUCO: Si existe la carpeta "dist", carga el archivo. 
  // Si no, intenta cargar el localhost (para cuando estés en StackBlitz).
  const isProd = !process.env.VITE_DEV_URL;

  if (app.isPackaged || isProd) {
    win.loadFile(path.join(__dirname, 'dist/index.html'))
  } else {
    win.loadURL('http://localhost:3000')
  }
}

app.whenReady().then(createWindow)

// Cerrar cuando todas las ventanas se cierren (estándar de Windows)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
