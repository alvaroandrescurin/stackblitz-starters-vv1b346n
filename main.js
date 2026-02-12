const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1280, // Un poco más grande para que se vea mejor
    height: 720,
    icon: path.join(__dirname, 'icon.ico'), // Aquí buscará tu icono
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // 1. Esto elimina la barra de File, Edit, View, etc.
  win.setMenu(null);

  // 2. Esto soluciona la pantalla en blanco en el .exe
  // Carga el archivo real del juego en lugar de una URL de internet
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  win.loadFile(indexPath);

  // Opcional: Abre el juego maximizado
  win.maximize();
}

app.whenReady().then(createWindow);

// Cerrar cuando todas las ventanas se cierren (estándar de Windows)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
