import { motion } from 'framer-motion'
import { useVPN } from '../context/VPNContext'
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import './Statistics.css'

const Statistics = () => {
  const { vpnState } = useVPN()

  const speedData = [
    { time: '00:00', download: 45, upload: 20 },
    { time: '04:00', download: 52, upload: 25 },
    { time: '08:00', download: 38, upload: 18 },
    { time: '12:00', download: 60, upload: 30 },
    { time: '16:00', download: 48, upload: 22 },
    { time: '20:00', download: 55, upload: 28 },
  ]

  const usageData = [
    { day: 'Пн', mb: 1200 },
    { day: 'Вт', mb: 1800 },
    { day: 'Ср', mb: 1500 },
    { day: 'Чт', mb: 2100 },
    { day: 'Пт', mb: 1900 },
    { day: 'Сб', mb: 1600 },
    { day: 'Вс', mb: 1400 },
  ]

  const stats = [
    { label: 'Всего подключений', value: '127' },
    { label: 'Защищено трафика', value: '12.5 GB' },
    { label: 'Блокировано угроз', value: '342' },
    { label: 'Средний ping', value: '24 ms' },
  ]

  return (
    <div className="statistics-page">
      <div className="page-header">
        <h1 className="page-title">Статистика</h1>
        <p className="page-subtitle">Аналитика использования VPN</p>
      </div>

      <div className="stats-grid">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: index * 0.03 }}
            className="stat-card"
          >
            <div className="stat-content">
              <div className="stat-label-large">{stat.label}</div>
              <div className="stat-value-large">{stat.value}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="chart-section">
        <h2 className="section-title">Скорость соединения</h2>
        <div className="chart-card">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={speedData}>
              <defs>
                <linearGradient id="downloadGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="uploadGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis 
                dataKey="time" 
                stroke="var(--text-secondary)"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="var(--text-secondary)"
                style={{ fontSize: '12px' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)'
                }}
              />
              <Area
                type="monotone"
                dataKey="download"
                stroke="var(--primary)"
                fillOpacity={1}
                fill="url(#downloadGradient)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="upload"
                stroke="var(--accent)"
                fillOpacity={1}
                fill="url(#uploadGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
          <div className="chart-legend">
            <div className="legend-item">
              <div className="legend-color" style={{ background: 'var(--primary)' }}></div>
              <span>Скачивание</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ background: 'var(--accent)' }}></div>
              <span>Загрузка</span>
            </div>
          </div>
        </div>
      </div>

      <div className="chart-section">
        <h2 className="section-title">Использование трафика</h2>
        <div className="chart-card">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={usageData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis 
                dataKey="day" 
                stroke="var(--text-secondary)"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="var(--text-secondary)"
                style={{ fontSize: '12px' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)'
                }}
              />
              <Line
                type="monotone"
                dataKey="mb"
                stroke="var(--primary)"
                strokeWidth={3}
                dot={{ fill: 'var(--primary)', r: 4 }}
                activeDot={{ r: 6, fill: 'var(--accent)' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {vpnState.isConnected && (
        <div className="current-session">
          <h2 className="section-title">Текущая сессия</h2>
          <div className="session-card">
            <div className="session-stat">
              <span className="session-label">Время подключения</span>
              <span className="session-value">
                {Math.floor(vpnState.connectionTime / 60)} мин {vpnState.connectionTime % 60} сек
              </span>
            </div>
            <div className="session-stat">
              <span className="session-label">Трафик</span>
              <span className="session-value">
                {(vpnState.downloadSpeed * vpnState.connectionTime / 60).toFixed(2)} MB
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Statistics
