import { motion } from 'framer-motion'
import { useVPN } from '../context/VPNContext'
import './Settings.css'

const Settings = () => {
  const { settings, updateSettings } = useVPN()

  const toggleSetting = (key: keyof typeof settings) => {
    updateSettings({ [key]: !settings[key] })
  }

  const settingItems = [
    {
      id: 'autoConnect',
      title: 'Автоподключение',
      description: 'Автоматически подключаться при запуске приложения',
    },
    {
      id: 'killSwitch',
      title: 'Kill Switch',
      description: 'Экстренное отключение интернета при потере VPN',
    },
    {
      id: 'splitTunneling',
      title: 'Split Tunneling',
      description: 'Выбор приложений для использования VPN',
    },
    {
      id: 'blockAds',
      title: 'Блокировщик рекламы',
      description: 'Блокировать рекламу и трекеры',
    },
    {
      id: 'blockMalware',
      title: 'Защита от вредоносных сайтов',
      description: 'Блокировать опасные веб-сайты',
    },
  ]

  const protocols = ['WireGuard', 'IKEv2', 'OpenVPN'] as const

  return (
    <div className="settings-page">
      <div className="page-header">
        <h1 className="page-title">Настройки</h1>
        <p className="page-subtitle">Управление параметрами VPN</p>
      </div>

      <div className="settings-section">
        <h2 className="section-title">Основные настройки</h2>
        <div className="settings-list">
          {settingItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.03 }}
              className="setting-item"
            >
              <div className="setting-info">
                <div className="setting-details">
                  <div className="setting-title">{item.title}</div>
                  <div className="setting-description">{item.description}</div>
                </div>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings[item.id as keyof typeof settings] as boolean}
                  onChange={() => toggleSetting(item.id as keyof typeof settings)}
                />
                <span className="toggle-slider"></span>
              </label>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="settings-section">
        <h2 className="section-title">Протокол подключения</h2>
        <div className="protocol-selector">
          {protocols.map((protocol) => (
            <button
              key={protocol}
              className={`protocol-button ${
                settings.protocol === protocol ? 'active' : ''
              }`}
              onClick={() => updateSettings({ protocol })}
            >
              <div className="protocol-name">{protocol}</div>
              {protocol === 'WireGuard' && (
                <div className="protocol-badge">Рекомендуется</div>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="settings-section">
        <h2 className="section-title">О приложении</h2>
        <div className="about-card">
          <div className="about-item">
            <span className="about-label">Версия</span>
            <span className="about-value">1.0.0</span>
          </div>
          <div className="about-item">
            <span className="about-label">Лицензия</span>
            <span className="about-value">Premium</span>
          </div>
          <div className="about-item">
            <span className="about-label">Серверов</span>
            <span className="about-value">200+</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
