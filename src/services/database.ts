// Сервис для работы с БД через Electron IPC

interface DatabaseAPI {
  login: (credentials: { email: string; password: string }) => Promise<{ success: boolean; user?: any; error?: string }>
  register: (data: { email: string; password: string; name: string }) => Promise<{ success: boolean; user?: any; error?: string }>
  telegramAuth: (telegramData: any) => Promise<{ success: boolean; user?: any; error?: string }>
  updateUser: (userId: number, userData: any) => Promise<{ success: boolean; user?: any; error?: string }>
  getUser: (userId: number) => Promise<{ success: boolean; user?: any; error?: string }>
}

declare global {
  interface Window {
    electronAPI?: {
      db: DatabaseAPI
    }
  }
}

export const databaseService = {
  async login(email: string, password: string) {
    if (!window.electronAPI?.db) {
      throw new Error('Database API не доступен')
    }
    return await window.electronAPI.db.login({ email, password })
  },

  async register(email: string, password: string, name: string) {
    if (!window.electronAPI?.db) {
      throw new Error('Database API не доступен')
    }
    return await window.electronAPI.db.register({ email, password, name })
  },

  async telegramAuth(telegramData: any) {
    if (!window.electronAPI?.db) {
      throw new Error('Database API не доступен')
    }
    return await window.electronAPI.db.telegramAuth(telegramData)
  },

  async updateUser(userId: number, userData: any) {
    if (!window.electronAPI?.db) {
      throw new Error('Database API не доступен')
    }
    return await window.electronAPI.db.updateUser(userId, userData)
  },

  async getUser(userId: number) {
    if (!window.electronAPI?.db) {
      throw new Error('Database API не доступен')
    }
    return await window.electronAPI.db.getUser(userId)
  },
}



