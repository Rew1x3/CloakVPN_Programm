export interface ElectronAPI {
  minimize?: () => void
  maximize?: () => void
  close?: () => void
  platform?: string
  openExternal?: (url: string) => Promise<void>
  telegramAuth?: () => Promise<{
    id: number
    first_name: string
    last_name?: string
    username?: string
    photo_url?: string
  } | null>
  onDeepLinkAuth?: (callback: (data: string) => void) => void
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI
    electron?: {
      openExternal: (url: string) => Promise<void>
      telegramAuth: () => Promise<{
        id: number
        first_name: string
        last_name?: string
        username?: string
        photo_url?: string
      } | null>
      onDeepLinkAuth?: (callback: (data: string) => void) => void
    }
  }
}



