import { Link, useLocation } from 'react-router-dom'
import './Navigation.css'

const Navigation = () => {
  const location = useLocation()

  const navItems = [
    { path: '/', icon: '🔒', label: 'Подключение' },
    { path: '/servers', icon: '🌍', label: 'Серверы' },
    { path: '/statistics', icon: '📊', label: 'Статистика' },
    { path: '/settings', icon: '⚙️', label: 'Настройки' },
  ]

  return (
    <nav className="bottom-navigation">
      {navItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
        >
          <span className="nav-icon">{item.icon}</span>
          <span className="nav-label">{item.label}</span>
        </Link>
      ))}
    </nav>
  )
}

export default Navigation



