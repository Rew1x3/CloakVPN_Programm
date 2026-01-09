const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  minimize: () => ipcRenderer.invoke('window-minimize'),
  maximize: () => ipcRenderer.invoke('window-maximize'),
  close: () => ipcRenderer.invoke('window-close'),
  
  // Примечание: Работа с базой данных теперь выполняется через Supabase клиент в renderer процессе
})

// Также экспортируем как electron для совместимости
contextBridge.exposeInMainWorld('electron', {
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  telegramAuth: async () => {
    // В Electron приложении открываем браузер для авторизации через Telegram
    const API_URL = process.env.VITE_API_URL || 'https://cloak-vpn.vercel.app'
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

// Слушаем deep link события
ipcRenderer.on('deep-link-auth', (_, data) => {
  // Сохраняем данные в localStorage для использования в компоненте
  try {
    const authData = JSON.parse(decodeURIComponent(data))
    localStorage.setItem('cloakvpn_app_auth', JSON.stringify(authData))
    // Отправляем событие в window для обработки в React
    window.dispatchEvent(new CustomEvent('cloakvpn-auth', { detail: authData }))
  } catch (e) {
    console.error('Failed to parse deep link auth data:', e)
  }
})
