import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  minimize: () => ipcRenderer.invoke('window-minimize'),
  maximize: () => ipcRenderer.invoke('window-maximize'),
  close: () => ipcRenderer.invoke('window-close'),
  
  // Database API
  db: {
    login: (credentials) => ipcRenderer.invoke('db-login', credentials),
    register: (data) => ipcRenderer.invoke('db-register', data),
    telegramAuth: (telegramData) => ipcRenderer.invoke('db-telegram-auth', telegramData),
    updateUser: (userId, userData) => ipcRenderer.invoke('db-update-user', { userId, userData }),
    getUser: (userId) => ipcRenderer.invoke('db-get-user', userId),
  },
})
