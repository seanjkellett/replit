const { app, BrowserWindow, Menu, shell } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let serverProcess;

const isDev = process.env.NODE_ENV === 'development';
const PORT = 3001; // Different from Vite dev server port (5000)

async function createServer() {
  console.log('Starting Village server...');
  
  // In development, we'll use the existing dev server
  if (isDev) {
    // The Vite dev server is already running on port 5000
    // We don't need to start our own server in dev mode
    console.log('Development mode: Using existing Vite dev server');
    return Promise.resolve();
  }

  // In production, import and start the Express server
  try {
    // Set environment to indicate we're running in Electron
    process.env.ELECTRON_APP = 'true';
    process.env.NODE_ENV = 'production';
    
    const { createServer } = await import('../server/index.js');
    const server = await createServer(PORT);
    
    console.log(`Village server started on port ${PORT}`);
    return server;
  } catch (error) {
    console.error('Failed to start Village server:', error);
    throw error;
  }
}

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: true
    },
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    show: false, // Don't show until ready
    title: 'Village - Mattermost Chat'
  });

  // Load the app
  const startUrl = isDev 
    ? 'http://localhost:5000'  // Vite dev server
    : `http://localhost:${PORT}`; // Production Express server

  console.log(`Loading Village from: ${startUrl}`);
  
  mainWindow.loadURL(startUrl);

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // Open DevTools in development
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Prevent navigation to external URLs
  mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    
    if (parsedUrl.origin !== startUrl.split('/').slice(0, 3).join('/')) {
      event.preventDefault();
      shell.openExternal(navigationUrl);
    }
  });
}

function createMenu() {
  const template = [
    {
      label: 'Village',
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideothers' },
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
        { role: 'selectall' }
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
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'close' }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// App event handlers
app.whenReady().then(async () => {
  try {
    await createServer();
    createWindow();
    createMenu();
    
    console.log('Village desktop app started successfully!');
  } catch (error) {
    console.error('Failed to start Village:', error);
    app.quit();
  }
});

app.on('window-all-closed', () => {
  // Kill server process if it exists
  if (serverProcess) {
    serverProcess.kill();
  }
  
  // On macOS, keep app running even when all windows are closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS, re-create window when dock icon is clicked
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, url) => {
    event.preventDefault();
    shell.openExternal(url);
  });
});

// Handle app updates (for future implementation)
app.on('ready', () => {
  // TODO: Add auto-updater logic here
});

console.log('Village Electron main process initialized');