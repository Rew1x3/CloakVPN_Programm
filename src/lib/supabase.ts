// Для Electron приложения используем прямой доступ к Supabase
// В Electron можно использовать fetch или axios

const SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || ''

export interface SupabaseClient {
  auth: {
    getSession: () => Promise<{ data: { session: any }, error: any }>
    signInWithPassword: (credentials: { email: string; password: string }) => Promise<any>
    signUp: (credentials: { email: string; password: string; options?: any }) => Promise<any>
    signOut: () => Promise<any>
    onAuthStateChange: (callback: (event: string, session: any) => void) => { data: { subscription: any } }
  }
  from: (table: string) => {
    select: (columns?: string) => {
      eq: (column: string, value: any) => {
        single: () => Promise<{ data: any; error: any }>
      }
    }
    insert: (data: any) => Promise<{ data: any; error: any }>
    update: (data: any) => {
      eq: (column: string, value: any) => Promise<{ data: any; error: any }>
    }
  }
}

// Упрощенная реализация для Electron
export const supabase: SupabaseClient = {
  auth: {
    async getSession() {
      const session = localStorage.getItem('supabase_session')
      return { data: { session: session ? JSON.parse(session) : null }, error: null }
    },
    async signInWithPassword(credentials) {
      const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
        },
        body: JSON.stringify(credentials),
      })
      const data = await response.json()
      if (data.access_token) {
        localStorage.setItem('supabase_session', JSON.stringify(data))
      }
      return { data, error: null }
    },
    async signUp(credentials) {
      const response = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
        },
        body: JSON.stringify(credentials),
      })
      const data = await response.json()
      return { data, error: null }
    },
    async signOut() {
      localStorage.removeItem('supabase_session')
      return { error: null }
    },
    onAuthStateChange(_callback) {
      // Упрощенная реализация
      return { data: { subscription: { unsubscribe: () => {} } } }
    },
  },
  from(_table: string) {
    return {
      select(_columns = '*') {
        return {
          eq(_column: string, _value: any) {
            return {
              async single() {
                // В Electron можно использовать IPC для запросов к БД
                return { data: null, error: null }
              },
            }
          },
        }
      },
      insert(_data: any) {
        return Promise.resolve({ data: null, error: null })
      },
      update(_data: any) {
        return {
          eq(_column: string, _value: any) {
            return Promise.resolve({ data: null, error: null })
          },
        }
      },
    }
  },
} as SupabaseClient

