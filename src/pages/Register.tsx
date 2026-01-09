import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Auth.css'

const Register = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Пароли не совпадают')
      return
    }

    if (password.length < 8) {
      setError('Пароль должен содержать минимум 8 символов')
      return
    }

    setIsLoading(true)

    try {
      await register(email, password, name)
      navigate('/')
    } catch (err: any) {
      setError(err.message || 'Ошибка регистрации')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-background">
        <div className="bg-gradient-1"></div>
        <div className="bg-gradient-2"></div>
      </div>

      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1 className="auth-title">Создать аккаунт</h1>
            <p className="auth-subtitle">Зарегистрируйтесь в CloakVPN</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {error && (
              <div className="auth-error">
                {error}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="name" className="form-label">Имя</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-input"
                placeholder="Ваше имя"
                required
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                placeholder="your@email.com"
                required
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">Пароль</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                placeholder="Минимум 8 символов"
                required
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">Подтвердите пароль</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="form-input"
                placeholder="Повторите пароль"
                required
                disabled={isLoading}
              />
            </div>

            <div className="form-agreement">
              <label className="checkbox-label">
                <input type="checkbox" required />
                <span>Я согласен с условиями использования и политикой конфиденциальности</span>
              </label>
            </div>

            <button
              type="submit"
              className="auth-button"
              disabled={isLoading}
            >
              {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Уже есть аккаунт?{' '}
              <Link to="/login" className="auth-link">
                Войти
              </Link>
            </p>
            <div className="auth-divider">
              <span>или</span>
            </div>
            <Link to="/telegram" className="telegram-auth-link">
              <span className="telegram-icon-small">📱</span>
              Войти через Telegram
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register



