import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Sidebar.css'
import logoImage from '../img/logo.jpg'

const Sidebar = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/telegram')
    } catch (error) {
      console.error('Logout error:', error)
      // Все равно редиректим на страницу авторизации
      navigate('/telegram')
    }
  }

  const navItems = [
    { path: '/', label: 'Подключение' },
    { path: '/servers', label: 'Серверы' },
    { path: '/statistics', label: 'Статистика' },
    { path: '/settings', label: 'Настройки' },
    { path: '/profile', label: 'Профиль' },
    { path: '/referral', label: 'Реферальная программа' },
  ]

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <img src={logoImage} alt="CloakVPN" className="logo-image" />
        </div>
      </div>
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
          >
            <span className="nav-indicator"></span>
            <span className="nav-label">{item.label}</span>
          </Link>
        ))}
      </nav>
      {user && (
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-name">{user.name}</div>
            <div className="user-plan">{user.subscription.plan === 'free' ? 'Бесплатный' : 'Премиум'}</div>
          </div>
          <button onClick={handleLogout} className="logout-button">
            <span>🚪</span>
            <span>Выйти</span>
          </button>
        </div>
      )}
    </aside>
  )
}

export default Sidebar
