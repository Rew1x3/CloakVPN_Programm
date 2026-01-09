import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { openTelegramAuth } from '../lib/telegramAuth'
import { databaseService } from '../services/database'
import './TelegramAuth.css'

// Для Electron приложения используем IPC для связи с Telegram
// Для веб-версии используем Telegram WebApp
declare global {
  interface Window {
    electron?: {
      openExternal: (url: string) => Promise<void>
      telegramAuth: () => Promise<{
        id: number
        first_name: string
        last_name?: string
        username?: string
        photo_url?: string
      } | null>
    }
    Telegram?: {
      WebApp: {
        initData: string
        initDataUnsafe: {
          user?: {
            id: number
            first_name: string
            last_name?: string
            username?: string
            photo_url?: string
          }
          auth_date: number
          hash: string
        }
        ready: () => void
        expand: () => void
        close: () => void
      }
    }
  }
}

const TelegramAuth = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const { loginWithTelegram } = useAuth()
  const navigate = useNavigate()

  // Функция для обработки deep link авторизации
  const handleAuthFromDeepLink = async (authData: any) => {
    setIsLoading(true)
    setError('')
    setInfo('')

    try {
      console.log('handleAuthFromDeepLink: received authData', {
        hasUser: !!authData.user,
        hasSession: !!authData.session,
        hasAccessToken: !!authData.session?.access_token,
        userId: authData.user?.id,
        telegramId: authData.user?.telegram_id
      })
      
      // Сначала устанавливаем сессию Supabase, если есть токены
      if (authData.session?.access_token) {
        console.log('Setting Supabase session with access_token...')
        const { supabase } = await import('../lib/supabase')
        
        const sessionResult = await supabase.auth.setSession({
          access_token: authData.session.access_token,
          refresh_token: authData.session.refresh_token || '',
        })
        
        if (sessionResult.error) {
          console.error('Error setting Supabase session:', sessionResult.error)
          throw new Error('Ошибка установки сессии: ' + sessionResult.error.message)
        }
        
        console.log('Supabase session set successfully:', {
          userId: sessionResult.data.user?.id,
          email: sessionResult.data.user?.email,
          hasSession: !!sessionResult.data.session
        })
        
        // Ждем немного, чтобы сессия точно установилась
        await new Promise(resolve => setTimeout(resolve, 300))
        
        // Получаем профиль пользователя из Supabase
        const result = await databaseService.getCurrentUser()
        console.log('getCurrentUser result:', {
          success: result.success,
          hasUser: !!result.user,
          error: result.error
        })
        
        if (result.success && result.user) {
          console.log('User profile loaded:', result.user)
          // Преобразуем данные из БД в формат User
          const mappedUser = {
            id: result.user.id.toString(),
            email: result.user.email || '',
            name: result.user.name || 'User',
            subscription: {
              plan: (result.user.subscription_plan || 'free') as 'free' | 'premium' | 'yearly' | 'family',
              expiresAt: result.user.subscription_expires_at || null,
              isActive: result.user.subscription_is_active !== false,
            },
            createdAt: result.user.created_at || new Date().toISOString(),
          }
          
          // Сохраняем пользователя в localStorage
          localStorage.setItem('cloakvpn_user', JSON.stringify(mappedUser))
          console.log('User saved to localStorage, navigating to /')
          
          // Перезагружаем страницу для обновления AuthContext
          // Это гарантирует, что AuthContext увидит сессию Supabase
          window.location.href = '/'
          return
        } else {
          console.error('Failed to get user profile:', result.error)
          // Пытаемся использовать данные из authData как fallback
          if (authData.user) {
            console.log('Using authData.user as fallback')
            const mappedUser = {
              id: authData.user.id?.toString() || '',
              email: authData.user.email || `telegram_${authData.user.telegram_id}@cloakvpn.local`,
              name: authData.user.name || 'User',
              subscription: {
                plan: (authData.user.subscription_plan || 'free') as 'free' | 'premium' | 'yearly' | 'family',
                expiresAt: authData.user.subscription_expires_at || null,
                isActive: authData.user.subscription_is_active !== false,
              },
              createdAt: authData.user.created_at || new Date().toISOString(),
            }
            localStorage.setItem('cloakvpn_user', JSON.stringify(mappedUser))
            window.location.href = '/'
            return
          }
          throw new Error('Не удалось получить профиль пользователя: ' + (result.error || 'Unknown error'))
        }
      }
      
      // Fallback: если нет токенов, используем старый метод через loginWithTelegram
      if (authData.user?.telegram_id) {
        console.log('Fallback: using loginWithTelegram with telegram_id:', authData.user.telegram_id)
        const telegramUser = {
          id: authData.user.telegram_id,
          first_name: authData.user.name?.split(' ')[0] || 'User',
          last_name: authData.user.name?.split(' ').slice(1).join(' ') || '',
          username: authData.user.telegram_username,
        }
        await loginWithTelegram(telegramUser)
        navigate('/')
      } else {
        throw new Error('Не удалось получить данные пользователя: нет токенов и нет telegram_id')
      }
    } catch (err: any) {
      console.error('Deep link auth error:', err)
      setError(err.message || 'Ошибка авторизации через deep link')
      setIsLoading(false)
    }
  }

  useEffect(() => {
    console.log('TelegramAuth: Setting up deep link listeners')
    
    // Обработка deep link для авторизации из бота
    if (window.electron?.onDeepLinkAuth) {
      console.log('TelegramAuth: Setting up onDeepLinkAuth callback')
      window.electron.onDeepLinkAuth((data: string) => {
        console.log('TelegramAuth: onDeepLinkAuth callback called, data length:', data?.length)
        try {
          const decodedData = decodeURIComponent(data)
          console.log('TelegramAuth: Decoded data:', decodedData.substring(0, 100) + '...')
          const authData = JSON.parse(decodedData)
          console.log('TelegramAuth: Parsed authData:', {
            hasUser: !!authData.user,
            hasSession: !!authData.session,
            userId: authData.user?.id
          })
          if (authData.user && authData.session) {
            console.log('TelegramAuth: Calling handleAuthFromDeepLink')
            handleAuthFromDeepLink(authData)
          } else {
            console.warn('TelegramAuth: Missing user or session in authData')
          }
        } catch (e) {
          console.error('TelegramAuth: Failed to parse deep link auth data:', e)
          setError('Ошибка обработки данных авторизации')
        }
      })
    } else {
      console.log('TelegramAuth: window.electron.onDeepLinkAuth not available')
    }

    // Слушаем событие deep link из preload
    const handleDeepLinkEvent = (event: CustomEvent) => {
      console.log('TelegramAuth: Received cloakvpn-auth event', event.detail)
      const authData = event.detail
      if (authData?.user && authData?.session) {
        console.log('TelegramAuth: Calling handleAuthFromDeepLink from event')
        handleAuthFromDeepLink(authData)
      } else {
        console.warn('TelegramAuth: Missing user or session in event detail')
      }
    }
    window.addEventListener('cloakvpn-auth', handleDeepLinkEvent as EventListener)
    console.log('TelegramAuth: Added cloakvpn-auth event listener')
    
    return () => {
      window.removeEventListener('cloakvpn-auth', handleDeepLinkEvent as EventListener)
      console.log('TelegramAuth: Removed cloakvpn-auth event listener')
    }

    // Проверяем, есть ли данные авторизации после возврата из браузера
    const checkAuthData = async () => {
      try {
        const authDataStr = localStorage.getItem('cloakvpn_app_auth')
        if (authDataStr) {
          console.log('Found auth data in localStorage, processing...')
          const authData = JSON.parse(authDataStr)
          if (authData.user && authData.session) {
            await handleAuthFromDeepLink(authData)
            localStorage.removeItem('cloakvpn_app_auth')
            return
          }
        }
      } catch (e) {
        console.error('Failed to parse auth data:', e)
        localStorage.removeItem('cloakvpn_app_auth')
      }
    }

    // Проверяем данные авторизации
    checkAuthData()

    // Инициализируем Telegram WebApp если доступен
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready()
      window.Telegram.WebApp.expand()
      
      // Автоматическая авторизация при открытии через Telegram WebApp
      const telegramUser = window.Telegram.WebApp.initDataUnsafe.user
      if (telegramUser) {
        setTimeout(() => {
          handleTelegramAuth()
        }, 500)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleTelegramAuth = async () => {
    setIsLoading(true)
    setError('')
    setInfo('')

    try {
      let telegramUser

      // Проверяем, есть ли доступ к Electron API
      if (window.electron?.openExternal) {
        // В Electron приложении открываем Telegram бота для авторизации
        const botUsername = import.meta.env.VITE_TELEGRAM_BOT_USERNAME || 'cloakv_bot'
        const botUrl = `https://t.me/${botUsername}?start=app_auth`
        await window.electron.openExternal(botUrl)
        
        setInfo('Откройте Telegram бота (@cloakv_bot) в браузере, нажмите кнопку "✅ Войти" и затем "🚀 Открыть CloakVPN". После авторизации вернитесь в приложение и нажмите кнопку "Проверить авторизацию" ниже.')
        
        // Добавляем кнопку для проверки авторизации
        setIsLoading(false)
        return
      } else if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
        // Для веб-версии используем Telegram WebApp
        telegramUser = window.Telegram.WebApp.initDataUnsafe.user
      } else if (window.Telegram?.WebApp?.initData) {
        // Пытаемся парсить initData вручную
        try {
          const params = new URLSearchParams(window.Telegram.WebApp.initData)
          const userParam = params.get('user')
          if (userParam) {
            telegramUser = JSON.parse(decodeURIComponent(userParam))
          }
        } catch (e) {
          console.error('Failed to parse initData:', e)
        }
      }
      
      // Если пользователь не найден, открываем сайт для авторизации
      if (!telegramUser) {
        await openTelegramAuth()
        setInfo('Откройте сайт в браузере и авторизуйтесь через Telegram.')
        setIsLoading(false)
        return
      }

      if (!telegramUser) {
        throw new Error('Не удалось получить данные пользователя Telegram')
      }

      // Авторизуем через Telegram
      await loginWithTelegram(telegramUser)
      navigate('/')
    } catch (err: any) {
      setError(err.message || 'Ошибка авторизации через Telegram')
      console.error('Telegram auth error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Если есть данные пользователя Telegram, показываем их
  const telegramUser = window.Telegram?.WebApp?.initDataUnsafe?.user

  console.log('TelegramAuth component rendering')
  return (
    <div className="auth-container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="auth-card" style={{ background: '#1A1625', padding: '40px', borderRadius: '20px', maxWidth: '500px', width: '100%' }}>
        <div className="auth-header">
          <h1 className="auth-title">Вход через Telegram</h1>
          <p className="auth-subtitle">Быстрый и безопасный вход через ваш Telegram аккаунт</p>
        </div>

        {telegramUser && (
          <div className="telegram-user-info">
            {telegramUser.photo_url && (
              <img src={telegramUser.photo_url} alt="Avatar" className="telegram-avatar" />
            )}
            <div className="telegram-user-details">
              <h3 className="telegram-user-name">
                {telegramUser.first_name} {telegramUser.last_name || ''}
              </h3>
              {telegramUser.username && (
                <p className="telegram-username">@{telegramUser.username}</p>
              )}
            </div>
          </div>
        )}

        {error && (
          <div className="auth-error">{error}</div>
        )}

        {info && (
          <div className="telegram-info">{info}</div>
        )}

        <button
          onClick={handleTelegramAuth}
          disabled={isLoading}
          className="telegram-button"
        >
          {isLoading ? 'Авторизация...' : 'Войти через Telegram'}
        </button>

        {info && window.electron?.openExternal && (
          <button
            onClick={async () => {
              setIsLoading(true)
              setError('')
              try {
                // Проверяем данные авторизации
                const authDataStr = localStorage.getItem('cloakvpn_app_auth')
                if (authDataStr) {
                  const authData = JSON.parse(authDataStr)
                  
                  if (authData.user && authData.session) {
                    // Используем session для авторизации в Supabase
                    if (authData.session.access_token) {
                      const { supabase } = await import('../lib/supabase')
                      const { data, error } = await supabase.auth.setSession({
                        access_token: authData.session.access_token,
                        refresh_token: authData.session.refresh_token || '',
                      })
                      
                      if (!error && data.user) {
                        const result = await databaseService.getCurrentUser()
                        if (result.success && result.user) {
                          const mappedUser = {
                            id: result.user.id.toString(),
                            email: result.user.email || '',
                            name: result.user.name || 'User',
                            subscription: {
                              plan: (result.user.subscription_plan || 'free') as 'free' | 'premium' | 'yearly' | 'family',
                              expiresAt: result.user.subscription_expires_at || null,
                              isActive: result.user.subscription_is_active !== false,
                            },
                            createdAt: result.user.created_at || new Date().toISOString(),
                          }
                          localStorage.setItem('cloakvpn_user', JSON.stringify(mappedUser))
                          localStorage.removeItem('cloakvpn_app_auth')
                          window.location.href = '/'
                          return
                        }
                      }
                    }
                    
                    // Fallback: используем данные напрямую
                    if (authData.user.telegram_id) {
                      const telegramUser = {
                        id: authData.user.telegram_id,
                        first_name: authData.user.name?.split(' ')[0] || 'User',
                        last_name: authData.user.name?.split(' ').slice(1).join(' ') || '',
                        username: authData.user.telegram_username,
                      }
                      await loginWithTelegram(telegramUser)
                      localStorage.removeItem('cloakvpn_app_auth')
                      navigate('/')
                    }
                  } else {
                    setError('Данные авторизации не найдены. Пожалуйста, авторизуйтесь на сайте.')
                  }
                } else {
                  setError('Данные авторизации не найдены. Пожалуйста, авторизуйтесь на сайте и нажмите кнопку "🚀 Открыть CloakVPN" в боте.')
                }
              } catch (e: any) {
                setError(e.message || 'Ошибка проверки авторизации')
                console.error('Error checking auth:', e)
              } finally {
                setIsLoading(false)
              }
            }}
            disabled={isLoading}
            className="telegram-button"
            style={{ marginTop: '10px', background: '#4CAF50' }}
          >
            {isLoading ? 'Проверка...' : 'Проверить авторизацию'}
          </button>
        )}

        <div className="auth-footer">
          <p>
            Нет Telegram?{' '}
            <Link to="/login" className="auth-link">
              Войти через Email
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default TelegramAuth
