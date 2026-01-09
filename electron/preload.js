const { contextBridge, ipcRenderer } = require('electron')

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

// Также экспортируем как electron для совместимости
contextBridge.exposeInMainWorld('electron', {
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  telegramAuth: async () => {
    // В Electron приложении открываем браузер для авторизации через Telegram
    const API_URL = process.env.VITE_API_URL || 'https://your-site.vercel.app'
    const botUsername = process.env.VITE_TELEGRAM_BOT_USERNAME || 'cloakv_bot'
    const authUrl = `https://t.me/${botUsername}?start=app_auth`
    
    // Открываем браузер
    await ipcRenderer.invoke('open-external', authUrl)
    
    // Возвращаем null, так как данные будут получены через callback URL
    return null
  },
  // Обработчик deep link для авторизации
  onDeepLinkAuth: (callback) => {
    ipcRenderer.on('deep-link-auth', (_, data) => {
      callback(data)
    })
  },
})
