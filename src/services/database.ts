// Сервис для работы с Supabase API

import { supabase } from '../lib/supabase'

export interface DatabaseUser {
  id: string
  email: string
  name: string
  subscription_plan?: 'free' | 'premium' | 'yearly' | 'family'
  subscription_expires_at?: string | null
  subscription_is_active?: boolean
  telegram_id?: number
  telegram_username?: string
  telegram_first_name?: string
  telegram_last_name?: string
  telegram_photo_url?: string
  created_at?: string
}

export const databaseService = {
  async login(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { success: false, error: error.message }
      }

      if (!data.user) {
        return { success: false, error: 'Пользователь не найден' }
      }

      // Получаем профиль пользователя из таблицы users
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single()

      if (profileError && profileError.code !== 'PGRST116') {
        // PGRST116 - это "не найдено", что нормально для нового пользователя
        console.error('Ошибка получения профиля:', profileError)
      }

      // Если профиля нет, создаем его
      if (!profile) {
        const { data: newProfile, error: createError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: data.user.email,
            name: data.user.email?.split('@')[0] || 'User',
            subscription_plan: 'free',
            subscription_is_active: true,
          })
          .select()
          .single()

        if (createError) {
          console.error('Ошибка создания профиля:', createError)
          return { success: false, error: 'Ошибка создания профиля' }
        }

        return { success: true, user: newProfile }
      }

      return { success: true, user: profile }
    } catch (error: any) {
      console.error('Login error:', error)
      return { success: false, error: error.message || 'Ошибка входа' }
    }
  },

  async register(email: string, password: string, name: string) {
    try {
      // Регистрируем пользователя в Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      })

      if (error) {
        return { success: false, error: error.message }
      }

      if (!data.user) {
        return { success: false, error: 'Не удалось создать пользователя' }
      }

      // Создаем профиль пользователя в таблице users
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          email: data.user.email,
          name,
          subscription_plan: 'free',
          subscription_is_active: true,
        })
        .select()
        .single()

      if (profileError) {
        console.error('Ошибка создания профиля:', profileError)
        return { success: false, error: 'Ошибка создания профиля' }
      }

      return { success: true, user: profile }
    } catch (error: any) {
      console.error('Register error:', error)
      return { success: false, error: error.message || 'Ошибка регистрации' }
    }
  },

  async telegramAuth(telegramData: {
    id: number
    first_name: string
    last_name?: string
    username?: string
    photo_url?: string
  }) {
    try {
      // Ищем пользователя по telegram_id
      const { data: existingUser, error: findError } = await supabase
        .from('users')
        .select('*')
        .eq('telegram_id', telegramData.id)
        .single()

      if (existingUser && !findError) {
        // Пользователь уже существует, обновляем данные
        const { data: updatedUser, error: updateError } = await supabase
          .from('users')
          .update({
            telegram_username: telegramData.username,
            telegram_first_name: telegramData.first_name,
            telegram_last_name: telegramData.last_name,
            telegram_photo_url: telegramData.photo_url,
          })
          .eq('id', existingUser.id)
          .select()
          .single()

        if (updateError) {
          console.error('Ошибка обновления пользователя:', updateError)
          return { success: false, error: 'Ошибка обновления пользователя' }
        }

        return { success: true, user: updatedUser }
      }

      // Создаем нового пользователя через Supabase Auth
      // Генерируем уникальный email на основе telegram_id
      const email = `telegram_${telegramData.id}@cloakvpn.local`
      // Генерируем случайный пароль
      const password = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}`

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            telegram_id: telegramData.id,
          },
        },
      })

      if (authError) {
        console.error('Ошибка создания пользователя в Auth:', authError)
        return { success: false, error: 'Ошибка создания пользователя' }
      }

      if (!authData.user) {
        return { success: false, error: 'Не удалось создать пользователя' }
      }

      // Создаем профиль пользователя
      const { data: newUser, error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: email,
          name: `${telegramData.first_name} ${telegramData.last_name || ''}`.trim(),
          telegram_id: telegramData.id,
          telegram_username: telegramData.username,
          telegram_first_name: telegramData.first_name,
          telegram_last_name: telegramData.last_name,
          telegram_photo_url: telegramData.photo_url,
          subscription_plan: 'free',
          subscription_is_active: true,
        })
        .select()
        .single()

      if (profileError) {
        console.error('Ошибка создания профиля:', profileError)
        return { success: false, error: 'Ошибка создания профиля' }
      }

      return { success: true, user: newUser }
    } catch (error: any) {
      console.error('Telegram auth error:', error)
      return { success: false, error: error.message || 'Ошибка авторизации через Telegram' }
    }
  },

  async updateUser(userId: string, userData: Partial<DatabaseUser>) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(userData)
        .eq('id', userId)
        .select()
        .single()

      if (error) {
        console.error('Ошибка обновления пользователя:', error)
        return { success: false, error: error.message || 'Ошибка обновления пользователя' }
      }

      return { success: true, user: data }
    } catch (error: any) {
      console.error('Update user error:', error)
      return { success: false, error: error.message || 'Ошибка обновления пользователя' }
    }
  },

  async getUser(userId: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Ошибка получения пользователя:', error)
        return { success: false, error: error.message || 'Пользователь не найден' }
      }

      return { success: true, user: data }
    } catch (error: any) {
      console.error('Get user error:', error)
      return { success: false, error: error.message || 'Ошибка получения пользователя' }
    }
  },

  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()

      if (error || !user) {
        return { success: false, error: 'Пользователь не авторизован' }
      }

      return await this.getUser(user.id)
    } catch (error: any) {
      console.error('Get current user error:', error)
      return { success: false, error: error.message || 'Ошибка получения текущего пользователя' }
    }
  },
}
