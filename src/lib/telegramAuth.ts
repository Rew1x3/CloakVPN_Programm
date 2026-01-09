// Утилита для авторизации через Telegram в Electron приложении

const API_URL = import.meta.env.VITE_API_URL || 'https://your-site.vercel.app'

export interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  photo_url?: string
}

/**
 * Открывает браузер для авторизации через Telegram
 * В Electron приложении можно использовать shell.openExternal
 */
export async function openTelegramAuth(): Promise<void> {
  const botUsername = import.meta.env.VITE_TELEGRAM_BOT_USERNAME || 'cloakv_bot'
  const API_URL = import.meta.env.VITE_API_URL || 'https://your-site.vercel.app'
  
  // Открываем бота с командой /start_app для авторизации в приложении
  const botUrl = `https://t.me/${botUsername}?start=app_auth`
  
  // В Electron используем IPC для открытия браузера
  if (window.electron?.openExternal) {
    await window.electron.openExternal(botUrl)
  } else {
    // В веб-версии открываем в новой вкладке
    window.open(botUrl, '_blank')
  }
}

/**
 * Авторизация через Telegram с данными пользователя
 * Используется когда пользователь уже авторизован в Telegram
 */
export async function loginWithTelegramData(telegramUser: TelegramUser): Promise<any> {
  try {
    const response = await fetch(`${API_URL}/api/telegram/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: telegramUser.id,
        first_name: telegramUser.first_name,
        last_name: telegramUser.last_name,
        username: telegramUser.username,
        photo_url: telegramUser.photo_url,
        auth_date: Math.floor(Date.now() / 1000),
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Ошибка авторизации через Telegram')
    }

    return data
  } catch (error: any) {
    console.error('Telegram auth error:', error)
    throw error
  }
}

/**
 * Проверяет, авторизован ли пользователь через Telegram в браузере
 * Используется для получения данных из URL после редиректа
 */
export function getTelegramAuthFromURL(): TelegramUser | null {
  if (typeof window === 'undefined') return null

  const urlParams = new URLSearchParams(window.location.search)
  const telegramData = urlParams.get('telegram_auth')

  if (telegramData) {
    try {
      return JSON.parse(decodeURIComponent(telegramData))
    } catch (e) {
      console.error('Failed to parse Telegram auth data:', e)
      return null
    }
  }

  return null
}

