import { useState } from 'react'
import { motion } from 'framer-motion'
import { useVPN } from '../context/VPNContext'
import './Servers.css'

const Servers = () => {
  const { servers, vpnState, selectServer } = useVPN()
  const [searchQuery, setSearchQuery] = useState('')
  const [showFavorites, setShowFavorites] = useState(false)

  const filteredServers = servers.filter((server) => {
    const matchesSearch = 
      server.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      server.city.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFavorite = !showFavorites || server.isFavorite
    return matchesSearch && matchesFavorite
  })

  const getLoadColor = (load: number) => {
    if (load < 30) return 'var(--success)'
    if (load < 60) return 'var(--warning)'
    return 'var(--error)'
  }

  const getPingColor = (ping: number) => {
    if (ping < 30) return 'var(--success)'
    if (ping < 100) return 'var(--warning)'
    return 'var(--error)'
  }

  return (
    <div className="servers-page">
      <div className="page-header">
        <h1 className="page-title">Выбор сервера</h1>
        <p className="page-subtitle">Выберите сервер для подключения</p>
      </div>

      <div className="servers-controls">
        <div className="search-box">
          <svg className="search-icon" width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M12.5 11H11.71L11.43 10.73C12.41 9.59 13 8.11 13 6.5C13 2.91 10.09 0 6.5 0C2.91 0 0 2.91 0 6.5C0 10.09 2.91 13 6.5 13C8.11 13 9.59 12.41 10.73 11.43L11 11.71V12.5L16 17.49L17.49 16L12.5 11ZM6.5 11C4.01 11 2 8.99 2 6.5C2 4.01 4.01 2 6.5 2C8.99 2 11 4.01 11 6.5C11 8.99 8.99 11 6.5 11Z" fill="currentColor"/>
          </svg>
          <input
            type="text"
            placeholder="Поиск по стране или городу..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
        <button
          className={`filter-button ${showFavorites ? 'active' : ''}`}
          onClick={() => setShowFavorites(!showFavorites)}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 0L10.163 5.582L16 6.123L12 10.09L12.944 16L8 13.082L3.056 16L4 10.09L0 6.123L5.837 5.582L8 0Z" fill="currentColor"/>
          </svg>
          <span>Избранное</span>
        </button>
      </div>

      <div className="servers-list">
        {filteredServers.map((server, index) => (
          <motion.div
            key={server.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: index * 0.03 }}
            className={`server-card ${
              vpnState.currentServer?.id === server.id ? 'selected' : ''
            } ${vpnState.isConnected && vpnState.currentServer?.id === server.id ? 'connected' : ''}`}
            onClick={() => selectServer(server)}
          >
            <div className="server-card-header">
              <div className="server-info">
                <div className="server-flag">{server.flag}</div>
                <div className="server-details">
                  <div className="server-name">{server.country}</div>
                  <div className="server-city">{server.city}</div>
                </div>
              </div>
              <div className="server-actions">
                {server.isFavorite && (
                  <div className="favorite-indicator">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M8 0L10.163 5.582L16 6.123L12 10.09L12.944 16L8 13.082L3.056 16L4 10.09L0 6.123L5.837 5.582L8 0Z" fill="currentColor"/>
                    </svg>
                  </div>
                )}
                {vpnState.currentServer?.id === server.id && (
                  <div className="selected-indicator">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M13.5 4L6 11.5L2.5 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )}
              </div>
            </div>

            <div className="server-stats">
              <div className="server-stat">
                <span className="stat-label">Ping</span>
                <span 
                  className="stat-value"
                  style={{ color: getPingColor(server.ping) }}
                >
                  {server.ping} ms
                </span>
              </div>
              <div className="server-stat">
                <span className="stat-label">Нагрузка</span>
                <div className="load-indicator">
                  <div 
                    className="load-bar"
                    style={{ 
                      width: `${server.load}%`,
                      backgroundColor: getLoadColor(server.load)
                    }}
                  />
                  <span className="load-text">{server.load}%</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredServers.length === 0 && (
        <div className="no-servers">
          <p>Серверы не найдены</p>
        </div>
      )}
    </div>
  )
}

export default Servers
