import { app, BrowserWindow, ipcMain, shell } from 'electron'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

let mainWindow = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    frame: false,
    titleBarStyle: 'hidden',
    backgroundColor: '#0F0B1E',
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    const indexPath = join(__dirname, '../dist/index.html')
    console.log('Loading index.html from:', indexPath)
    mainWindow.loadFile(indexPath)
      .then(() => {
        console.log('Index.html loaded successfully')
      })
      .catch((err) => {
        console.error('Error loading index.html:', err)
      })
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

// IPC handlers для работы с приложением
// Примечание: Работа с базой данных теперь выполняется через Supabase клиент в renderer процессе

// Window controls
ipcMain.handle('window-minimize', () => {
  if (mainWindow) mainWindow.minimize()
})

ipcMain.handle('window-maximize', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize()
    } else {
      mainWindow.maximize()
    }
  }
})

ipcMain.handle('window-close', () => {
  if (mainWindow) mainWindow.close()
})

ipcMain.handle('open-external', async (_, url) => {
  await shell.openExternal(url)
})

// Обработка deep link для авторизации (cloakvpn://auth?data=...)
// Регистрируем протокол ДО app.whenReady()
app.setAsDefaultProtocolClient('cloakvpn')

// Функция для обработки deep link
function handleDeepLink(url) {
  try {
    const urlObj = new URL(url)
    if (urlObj.protocol === 'cloakvpn:' && urlObj.pathname === '//auth') {
      const data = urlObj.searchParams.get('data')
      if (data && mainWindow) {
        // Отправляем данные в renderer процесс
        mainWindow.webContents.send('deep-link-auth', decodeURIComponent(data))
      }
    }
  } catch (error) {
    console.error('Error handling deep link:', error)
  }
}

// Обработка deep link при запуске приложения
const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // Обрабатываем deep link из второго экземпляра
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
      
      // Парсим deep link
      const url = commandLine.find(arg => arg.startsWith('cloakvpn://'))
      if (url) {
        handleDeepLink(url)
      }
    }
  })
}

// Обработка deep link при открытии приложения через протокол (macOS)
app.on('open-url', (event, url) => {
  event.preventDefault()
  handleDeepLink(url)
})

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })

  // Проверяем deep link из аргументов при запуске (Windows/Linux)
  if (process.platform === 'win32' || process.platform === 'linux') {
    const url = process.argv.find(arg => arg.startsWith('cloakvpn://'))
    if (url) {
      setTimeout(() => handleDeepLink(url), 1000) // Даем время окну загрузиться
    }
  }
})


app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
