import { app, BrowserWindow, ipcMain, shell } from 'electron'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { initDatabase, db } from './database.js'
import crypto from 'crypto'

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
        // Временно открываем DevTools для отладки
        mainWindow.webContents.openDevTools()
      })
      .catch((err) => {
        console.error('Error loading index.html:', err)
        mainWindow.webContents.openDevTools()
      })
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

// Хеширование пароля
const hashPassword = (password) => {
  return crypto.createHash('sha256').update(password).digest('hex')
}

// IPC handlers для работы с БД
ipcMain.handle('db-login', async (_, { email, password }) => {
  try {
    const user = await db.findUserByEmail(email)
    if (!user) {
      throw new Error('Пользователь не найден')
    }

    if (!user.password_hash) {
      throw new Error('Неверный способ входа')
    }

    const passwordHash = hashPassword(password)
    if (user.password_hash !== passwordHash) {
      throw new Error('Неверный пароль')
    }

    // Возвращаем пользователя без пароля
    const { password_hash, ...userWithoutPassword } = user
    return { success: true, user: userWithoutPassword }
  } catch (error) {
    return { success: false, error: error.message }
  }
})

ipcMain.handle('db-register', async (_, { email, password, name }) => {
  try {
    // Проверяем, существует ли пользователь
    const existingUser = await db.findUserByEmail(email)
    if (existingUser) {
      throw new Error('Пользователь с таким email уже существует')
    }

    const passwordHash = hashPassword(password)
    const user = await db.createUser({
      email,
      name,
      passwordHash,
    })

    const { password_hash, ...userWithoutPassword } = user
    return { success: true, user: userWithoutPassword }
  } catch (error) {
    return { success: false, error: error.message }
  }
})

ipcMain.handle('db-telegram-auth', async (_, telegramData) => {
  try {
    const { id, first_name, last_name, username, photo_url } = telegramData

    // Ищем пользователя по Telegram ID
    let user = await db.findUserByTelegramId(id)

    if (user) {
      // Обновляем данные Telegram
      user = await db.updateUser(user.id, {
        telegram_username: username,
        telegram_first_name: first_name,
        telegram_last_name: last_name,
        telegram_photo_url: photo_url,
      })
    } else {
      // Создаем нового пользователя
      const email = `telegram_${id}@cloakvpn.local`
      user = await db.createUser({
        email,
        name: `${first_name} ${last_name || ''}`.trim(),
        telegramId: id,
        telegramUsername: username,
        telegramFirstName: first_name,
        telegramLastName: last_name,
        telegramPhotoUrl: photo_url,
      })
    }

    const { password_hash, ...userWithoutPassword } = user
    return { success: true, user: userWithoutPassword }
  } catch (error) {
    return { success: false, error: error.message }
  }
})

ipcMain.handle('db-update-user', async (_, { userId, userData }) => {
  try {
    const user = await db.updateUser(userId, userData)
    if (!user) {
      throw new Error('Пользователь не найден')
    }

    const { password_hash, ...userWithoutPassword } = user
    return { success: true, user: userWithoutPassword }
  } catch (error) {
    return { success: false, error: error.message }
  }
})

ipcMain.handle('db-get-user', async (_, userId) => {
  try {
    const user = await db.getUserById(userId)
    if (!user) {
      throw new Error('Пользователь не найден')
    }

    const { password_hash, ...userWithoutPassword } = user
    return { success: true, user: userWithoutPassword }
  } catch (error) {
    return { success: false, error: error.message }
  }
})

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

app.whenReady().then(async () => {
  // Инициализируем БД при запуске
  try {
    await initDatabase()
    console.log('База данных готова')
  } catch (error) {
    console.error('Ошибка инициализации БД:', error)
  }

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
