import { motion } from 'framer-motion'
import { useVPN } from '../context/VPNContext'
import './Home.css'

const Home = () => {
  const { vpnState, connect, disconnect } = useVPN()

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="home-page">
      <div className="home-background">
        <div className="bg-gradient-1"></div>
        <div className="bg-gradient-2"></div>
      </div>

      <div className="home-content">
        <div className="home-header">
          <h1 className="page-title">VPN Подключение</h1>
          <p className="page-subtitle">Защитите своё соединение одним кликом</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="connection-card"
        >
          <div className="status-section">
            <div className={`status-badge ${vpnState.isConnected ? 'connected' : 'disconnected'}`}>
              <div className="status-indicator-dot"></div>
              <span className="status-text">
                {vpnState.isConnected ? 'Защищено' : 'Не защищено'}
              </span>
            </div>
          </div>

          <div className="connection-visual">
            <div className={`connection-circle ${vpnState.isConnected ? 'active' : ''}`}>
              <div className="circle-inner">
                <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                  {vpnState.isConnected ? (
                    <>
                      <path d="M32 8L40 16H48C50.1217 16 52.1566 16.8429 53.6569 18.3431C55.1571 19.8434 56 21.8783 56 24V40C56 42.1217 55.1571 44.1566 53.6569 45.6569C52.1566 47.1571 50.1217 48 48 48H16C13.8783 48 11.8434 47.1571 10.3431 45.6569C8.84286 44.1566 8 42.1217 8 40V24C8 21.8783 8.84286 19.8434 10.3431 18.3431C11.8434 16.8429 13.8783 16 16 16H24L32 8Z" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M32 28V36M28 32H36" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                    </>
                  ) : (
                    <>
                      <path d="M32 8L40 16H48C50.1217 16 52.1566 16.8429 53.6569 18.3431C55.1571 19.8434 56 21.8783 56 24V40C56 42.1217 55.1571 44.1566 53.6569 45.6569C52.1566 47.1571 50.1217 48 48 48H16C13.8783 48 11.8434 47.1571 10.3431 45.6569C8.84286 44.1566 8 42.1217 8 40V24C8 21.8783 8.84286 19.8434 10.3431 18.3431C11.8434 16.8429 13.8783 16 16 16H24L32 8Z" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M24 32L40 32" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                    </>
                  )}
                </svg>
              </div>
              {vpnState.isConnected && (
                <div className="connection-rings">
                  <div className="ring ring-1"></div>
                  <div className="ring ring-2"></div>
                  <div className="ring ring-3"></div>
                </div>
              )}
            </div>
          </div>

          <button
            className={`connect-button ${vpnState.isConnected ? 'connected' : ''}`}
            onClick={vpnState.isConnected ? disconnect : connect}
          >
            <span className="button-text">
              {vpnState.isConnected ? 'Отключить VPN' : 'Подключить VPN'}
            </span>
          </button>

          {vpnState.currentServer && (
            <div className="server-preview">
              <div className="server-preview-flag">{vpnState.currentServer.flag}</div>
              <div className="server-preview-info">
                <div className="server-preview-country">{vpnState.currentServer.country}</div>
                <div className="server-preview-city">{vpnState.currentServer.city}</div>
              </div>
            </div>
          )}
        </motion.div>

        {vpnState.isConnected && vpnState.currentServer && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="stats-section"
          >
            <h2 className="stats-title">Статистика подключения</h2>
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-content">
                  <div className="stat-label">Время сессии</div>
                  <div className="stat-value">{formatTime(vpnState.connectionTime)}</div>
                </div>
              </div>
              <div className="stat-item">
                <div className="stat-content">
                  <div className="stat-label">Скачивание</div>
                  <div className="stat-value">{vpnState.downloadSpeed} Mbps</div>
                </div>
              </div>
              <div className="stat-item">
                <div className="stat-content">
                  <div className="stat-label">Загрузка</div>
                  <div className="stat-value">{vpnState.uploadSpeed} Mbps</div>
                </div>
              </div>
              <div className="stat-item">
                <div className="stat-content">
                  <div className="stat-label">Ping</div>
                  <div className="stat-value">{vpnState.ping} ms</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {!vpnState.isConnected && (
          <div className="quick-tip">
            <p>Выберите сервер на вкладке "Серверы" для подключения</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Home
