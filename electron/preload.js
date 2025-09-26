const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Basic app info
  getVersion: () => process.versions.electron,
  getPlatform: () => process.platform,
  getAppVersion: () => require('../package.json').version,
  
  // System info
  isElectron: () => true,
  
  // Window controls (for future use)
  minimize: () => ipcRenderer.invoke('window-minimize'),
  maximize: () => ipcRenderer.invoke('window-maximize'),
  close: () => ipcRenderer.invoke('window-close'),
  
  // Future: IPC methods for Phase 2
  // These will replace HTTP calls to the local server
  // auth: {
  //   login: (credentials) => ipcRenderer.invoke('auth-login', credentials),
  //   logout: () => ipcRenderer.invoke('auth-logout'),
  //   getCurrentUser: () => ipcRenderer.invoke('auth-get-current-user')
  // },
  // 
  // messages: {
  //   getMessages: (channelId) => ipcRenderer.invoke('messages-get', channelId),
  //   sendMessage: (messageData) => ipcRenderer.invoke('messages-send', messageData)
  // },
  //
  // users: {
  //   getUsers: () => ipcRenderer.invoke('users-get-all'),
  //   getUserById: (userId) => ipcRenderer.invoke('users-get-by-id', userId)
  // },
  //
  // directMessages: {
  //   getDirectMessages: () => ipcRenderer.invoke('dm-get-all'),
  //   createDirectMessage: (userId) => ipcRenderer.invoke('dm-create', userId)
  // }
});

// Development helpers
if (process.env.NODE_ENV === 'development') {
  contextBridge.exposeInMainWorld('electronDev', {
    openDevTools: () => ipcRenderer.invoke('dev-open-devtools'),
    reload: () => ipcRenderer.invoke('dev-reload')
  });
}

// Log that preload script loaded
console.log('Village Electron preload script loaded');

// Security: Remove node globals from renderer
delete global.process;
delete global.Buffer;
delete global.setImmediate;
delete global.clearImmediate;

// Notify renderer that Electron API is available
window.addEventListener('DOMContentLoaded', () => {
  const event = new CustomEvent('electron-api-ready', {
    detail: { isElectron: true }
  });
  window.dispatchEvent(event);
});