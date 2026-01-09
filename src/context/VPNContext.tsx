import React, { createContext, useContext, useState, useEffect } from 'react'

interface VPNState {
  isConnected: boolean
  currentServer: Server | null
  connectionTime: number
  downloadSpeed: number
  uploadSpeed: number
  ping: number
}

interface Server {
  id: string
  country: string
  city: string
  flag: string
  ping: number
  load: number
  isFavorite: boolean
}

interface VPNContextType {
  vpnState: VPNState
  servers: Server[]
  settings: VPNSettings
  connect: () => void
  disconnect: () => void
  selectServer: (server: Server) => void
  updateSettings: (settings: Partial<VPNSettings>) => void
  toggleFavorite: (serverId: string) => void
}

interface VPNSettings {
  autoConnect: boolean
  killSwitch: boolean
  splitTunneling: boolean
  blockAds: boolean
  blockMalware: boolean
  protocol: 'WireGuard' | 'IKEv2' | 'OpenVPN'
}

const VPNContext = createContext<VPNContextType | undefined>(undefined)

export const VPNProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [vpnState, setVpnState] = useState<VPNState>({
    isConnected: false,
    currentServer: null,
    connectionTime: 0,
    downloadSpeed: 0,
    uploadSpeed: 0,
    ping: 0,
  })

  const [servers] = useState<Server[]>([
    { id: '1', country: 'United States', city: 'New York', flag: '🇺🇸', ping: 12, load: 23, isFavorite: true },
    { id: '2', country: 'United Kingdom', city: 'London', flag: '🇬🇧', ping: 18, load: 45, isFavorite: false },
    { id: '3', country: 'Germany', city: 'Frankfurt', flag: '🇩🇪', ping: 22, load: 31, isFavorite: true },
    { id: '4', country: 'Japan', city: 'Tokyo', flag: '🇯🇵', ping: 89, load: 12, isFavorite: false },
    { id: '5', country: 'Netherlands', city: 'Amsterdam', flag: '🇳🇱', ping: 15, load: 28, isFavorite: false },
    { id: '6', country: 'Singapore', city: 'Singapore', flag: '🇸🇬', ping: 156, load: 19, isFavorite: false },
    { id: '7', country: 'Canada', city: 'Toronto', flag: '🇨🇦', ping: 34, load: 37, isFavorite: false },
    { id: '8', country: 'France', city: 'Paris', flag: '🇫🇷', ping: 19, load: 42, isFavorite: false },
    { id: '9', country: 'Australia', city: 'Sydney', flag: '🇦🇺', ping: 178, load: 15, isFavorite: false },
    { id: '10', country: 'Switzerland', city: 'Zurich', flag: '🇨🇭', ping: 25, load: 33, isFavorite: false },
  ])

  const [settings, setSettings] = useState<VPNSettings>({
    autoConnect: false,
    killSwitch: true,
    splitTunneling: false,
    blockAds: true,
    blockMalware: true,
    protocol: 'WireGuard',
  })

  const [connectionTimer, setConnectionTimer] = useState<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (vpnState.isConnected) {
      const timer = setInterval(() => {
        setVpnState(prev => ({
          ...prev,
          connectionTime: prev.connectionTime + 1,
          downloadSpeed: Math.floor(Math.random() * 50) + 20,
          uploadSpeed: Math.floor(Math.random() * 30) + 10,
          ping: Math.floor(Math.random() * 20) + (prev.currentServer?.ping || 0),
        }))
      }, 1000)
      setConnectionTimer(timer)
    } else {
      if (connectionTimer) {
        clearInterval(connectionTimer)
        setConnectionTimer(null)
      }
      setVpnState(prev => ({
        ...prev,
        connectionTime: 0,
        downloadSpeed: 0,
        uploadSpeed: 0,
        ping: 0,
      }))
    }

    return () => {
      if (connectionTimer) clearInterval(connectionTimer)
    }
  }, [vpnState.isConnected])

  const connect = () => {
    if (!vpnState.currentServer) {
      const bestServer = servers.reduce((best, server) => 
        server.ping < best.ping ? server : best
      )
      setVpnState(prev => ({ ...prev, currentServer: bestServer, isConnected: true }))
    } else {
      setVpnState(prev => ({ ...prev, isConnected: true }))
    }
  }

  const disconnect = () => {
    setVpnState(prev => ({ ...prev, isConnected: false }))
  }

  const selectServer = (server: Server) => {
    if (vpnState.isConnected) {
      setVpnState(prev => ({ ...prev, currentServer: server }))
    } else {
      setVpnState(prev => ({ ...prev, currentServer: server }))
    }
  }

  const updateSettings = (newSettings: Partial<VPNSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }))
  }

  const toggleFavorite = (serverId: string) => {
    // This would update the servers list in a real app
    console.log('Toggle favorite:', serverId)
  }

  return (
    <VPNContext.Provider
      value={{
        vpnState,
        servers,
        settings,
        connect,
        disconnect,
        selectServer,
        updateSettings,
        toggleFavorite,
      }}
    >
      {children}
    </VPNContext.Provider>
  )
}

export const useVPN = () => {
  const context = useContext(VPNContext)
  if (!context) {
    throw new Error('useVPN must be used within VPNProvider')
  }
  return context
}



