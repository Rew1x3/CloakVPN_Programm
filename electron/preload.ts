import { contextBridge, ipcRenderer } from 'electron'

const electronAPI = {
  minimize: () => ipcRenderer.invoke('window-minimize'),
  maximize: () => ipcRenderer.invoke('window-maximize'),
  close: () => ipcRenderer.invoke('window-close'),
  platform: process.platform,
  openExternal: (url: string) => ipcRenderer.invoke('open-external', url),
}

contextBridge.exposeInMainWorld('electronAPI', electronAPI)

// Также экспортируем как electron для совместимости
contextBridge.exposeInMainWorld('electron', {
  openExternal: (url: string) => ipcRenderer.invoke('open-external', url),
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
  onDeepLinkAuth: (callback: (data: string) => void) => {
    ipcRenderer.on('deep-link-auth', (_, data: string) => {
      callback(data)
    })
  },
})
