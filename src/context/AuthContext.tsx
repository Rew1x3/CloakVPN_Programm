import React, { createContext, useContext, useState, useEffect } from 'react'
import { databaseService } from '../services/database'

interface User {
  id: string
  email: string
  name: string
  subscription: {
    plan: 'free' | 'premium' | 'yearly' | 'family'
    expiresAt: string | null
    isActive: boolean
  }
  createdAt: string
}

interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  photo_url?: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  loginWithTelegram: (telegramUser: TelegramUser) => Promise<void>
  logout: () => void
  updateUser: (userData: Partial<User>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Преобразование данных из БД в формат User
const mapDbUserToUser = (dbUser: any): User => {
  return {
    id: dbUser.id.toString(),
    email: dbUser.email,
    name: dbUser.name,
    subscription: {
      plan: (dbUser.subscription_plan || 'free') as 'free' | 'premium' | 'yearly' | 'family',
      expiresAt: dbUser.subscription_expires_at || null,
      isActive: dbUser.subscription_is_active !== false,
    },
    createdAt: dbUser.created_at || dbUser.createdAt || new Date().toISOString(),
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Проверяем сохраненную сессию
    const savedUser = localStorage.getItem('cloakvpn_user')
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser)
        setUser(parsedUser)
        
        // Проверяем актуальность данных пользователя в БД
        if (window.electronAPI?.db && parsedUser.id) {
          databaseService.getUser(parseInt(parsedUser.id))
            .then((result) => {
              if (result.success && result.user) {
                const updatedUser = mapDbUserToUser(result.user)
                setUser(updatedUser)
                localStorage.setItem('cloakvpn_user', JSON.stringify(updatedUser))
              }
            })
            .catch(() => {
              // Игнорируем ошибки при обновлении
            })
        }
      } catch (error) {
        console.error('Ошибка загрузки пользователя:', error)
        localStorage.removeItem('cloakvpn_user')
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const result = await databaseService.login(email, password)
      
      if (!result.success) {
        throw new Error(result.error || 'Ошибка входа')
      }

      if (!result.user) {
        throw new Error('Пользователь не найден')
      }

      const user = mapDbUserToUser(result.user)
      setUser(user)
      localStorage.setItem('cloakvpn_user', JSON.stringify(user))
    } catch (error: any) {
      console.error('Login error:', error)
      throw error
    }
  }

  const register = async (email: string, password: string, name: string) => {
    try {
      const result = await databaseService.register(email, password, name)
      
      if (!result.success) {
        throw new Error(result.error || 'Ошибка регистрации')
      }

      if (!result.user) {
        throw new Error('Не удалось создать пользователя')
      }

      const user = mapDbUserToUser(result.user)
      setUser(user)
      localStorage.setItem('cloakvpn_user', JSON.stringify(user))
    } catch (error: any) {
      console.error('Register error:', error)
      throw error
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('cloakvpn_user')
    localStorage.removeItem('cloakvpn_telegram_id')
  }

  const loginWithTelegram = async (telegramUser: TelegramUser) => {
    try {
      const result = await databaseService.telegramAuth({
        id: telegramUser.id,
        first_name: telegramUser.first_name,
        last_name: telegramUser.last_name,
        username: telegramUser.username,
        photo_url: telegramUser.photo_url,
      })

      if (!result.success) {
        throw new Error(result.error || 'Ошибка авторизации через Telegram')
      }

      if (!result.user) {
        throw new Error('Не удалось авторизоваться')
      }

      const user = mapDbUserToUser(result.user)
      setUser(user)
      localStorage.setItem('cloakvpn_user', JSON.stringify(user))
      localStorage.setItem('cloakvpn_telegram_id', telegramUser.id.toString())
    } catch (error: any) {
      console.error('Telegram auth error:', error)
      throw error
    }
  }

  const updateUser = async (userData: Partial<User>) => {
    if (!user) {
      throw new Error('Пользователь не авторизован')
    }

    try {
      // Преобразуем данные для БД
      const dbData: any = {}
      if (userData.name !== undefined) dbData.name = userData.name
      if (userData.email !== undefined) dbData.email = userData.email
      if (userData.subscription) {
        dbData.subscription_plan = userData.subscription.plan
        dbData.subscription_expires_at = userData.subscription.expiresAt
        dbData.subscription_is_active = userData.subscription.isActive
      }

      const result = await databaseService.updateUser(parseInt(user.id), dbData)

      if (!result.success) {
        throw new Error(result.error || 'Ошибка обновления пользователя')
      }

      if (result.user) {
        const updatedUser = mapDbUserToUser(result.user)
        setUser(updatedUser)
        localStorage.setItem('cloakvpn_user', JSON.stringify(updatedUser))
      }
    } catch (error: any) {
      console.error('Update user error:', error)
      throw error
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        loginWithTelegram,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
