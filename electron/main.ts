import { app, BrowserWindow, ipcMain, shell, protocol } from 'electron'
import { join } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = join(__filename, '..')

let mainWindow: BrowserWindow | null = null

// Регистрируем протокол для deep links
const PROTOCOL_NAME = 'cloakvpn'

// Регистрируем протокол только в продакшене
if (process.defaultApp) {
  if (process.platform === 'win32') {
    app.setAsDefaultProtocolClient(PROTOCOL_NAME, process.execPath, [join(process.resourcesPath, '..', '..')])
  } else {
    app.setAsDefaultProtocolClient(PROTOCOL_NAME)
  }
} else {
  app.setAsDefaultProtocolClient(PROTOCOL_NAME)
}

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
    mainWindow.loadFile(join(__dirname, '../dist/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

// IPC handlers
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

// Открытие внешних ссылок (для Telegram авторизации)
ipcMain.handle('open-external', (_, url: string) => {
  shell.openExternal(url)
})

// Обработка deep link для авторизации
function handleDeepLink(url: string) {
  if (!mainWindow) return
  
  try {
    const urlObj = new URL(url)
    if (urlObj.protocol === `${PROTOCOL_NAME}:`) {
      const data = urlObj.searchParams.get('data')
      if (data) {
        // Отправляем данные в renderer
        mainWindow.webContents.send('deep-link-auth', data)
      }
    }
  } catch (e) {
    console.error('Failed to parse deep link:', e)
  }
}

// Обработка deep link на macOS
app.on('open-url', (event, url) => {
  event.preventDefault()
  handleDeepLink(url)
})

// Обработка deep link на Windows/Linux (через аргументы командной строки)
app.on('second-instance', (event, commandLine) => {
  // Если приложение уже запущено, фокусируем окно
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore()
    mainWindow.focus()
  }
  
  // Обрабатываем deep link из аргументов
  const url = commandLine.find(arg => arg.startsWith(`${PROTOCOL_NAME}://`))
  if (url) {
    handleDeepLink(url)
  }
})

// Проверяем, не запущено ли уже приложение (только для Windows/Linux)
const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  // Обрабатываем deep link из аргументов при запуске
  const url = process.argv.find(arg => arg.startsWith(`${PROTOCOL_NAME}://`))
  if (url) {
    app.whenReady().then(() => {
      handleDeepLink(url)
    })
  }
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
