import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import './Profile.css'

const Profile = () => {
  const { user, logout, updateUser } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')

  if (!user) {
    return null
  }

  const handleSave = async () => {
    try {
      await updateUser({ name, email })
      setIsEditing(false)
    } catch (error: any) {
      console.error('Ошибка сохранения:', error)
      alert(error.message || 'Ошибка сохранения данных')
    }
  }

  const handleCancel = () => {
    setName(user.name)
    setEmail(user.email)
    setIsEditing(false)
  }

  const getPlanName = (plan: string) => {
    const plans: Record<string, string> = {
      free: 'Бесплатный',
      premium: 'Премиум',
      yearly: 'Годовой',
      family: 'Семейный',
    }
    return plans[plan] || plan
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Не ограничено'
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className="profile-page">
      <div className="page-header">
        <h1 className="page-title">Личный кабинет</h1>
        <p className="page-subtitle">Управление аккаунтом и подпиской</p>
      </div>

      <div className="profile-content">
        <div className="profile-section">
          <h2 className="section-title">Личная информация</h2>
          <div className="profile-card">
            <div className="profile-field">
              <label className="field-label">Имя</label>
              {isEditing ? (
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="field-input"
                />
              ) : (
                <div className="field-value">{user.name}</div>
              )}
            </div>

            <div className="profile-field">
              <label className="field-label">Email</label>
              {isEditing ? (
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="field-input"
                />
              ) : (
                <div className="field-value">{user.email}</div>
              )}
            </div>

            <div className="profile-field">
              <label className="field-label">Дата регистрации</label>
              <div className="field-value">
                {new Date(user.createdAt).toLocaleDateString('ru-RU', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
            </div>

            <div className="profile-actions">
              {isEditing ? (
                <>
                  <button className="button-primary" onClick={handleSave}>
                    Сохранить
                  </button>
                  <button className="button-secondary" onClick={handleCancel}>
                    Отмена
                  </button>
                </>
              ) : (
                <button className="button-primary" onClick={() => setIsEditing(true)}>
                  Редактировать
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="profile-section">
          <h2 className="section-title">Подписка</h2>
          <div className="subscription-card">
            <div className="subscription-header">
              <div>
                <div className="subscription-plan">{getPlanName(user.subscription.plan)}</div>
                <div className="subscription-status">
                  {user.subscription.isActive ? (
                    <span className="status-active">Активна</span>
                  ) : (
                    <span className="status-inactive">Неактивна</span>
                  )}
                </div>
              </div>
              {user.subscription.plan === 'free' && (
                <a href="https://cloakvpn.com/subscribe" target="_blank" rel="noopener noreferrer" className="upgrade-button">
                  Обновить
                </a>
              )}
            </div>

            <div className="subscription-details">
              <div className="subscription-detail">
                <span className="detail-label">План</span>
                <span className="detail-value">{getPlanName(user.subscription.plan)}</span>
              </div>
              <div className="subscription-detail">
                <span className="detail-label">Истекает</span>
                <span className="detail-value">{formatDate(user.subscription.expiresAt)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="profile-section">
          <h2 className="section-title">Безопасность</h2>
          <div className="profile-card">
            <div className="security-item">
              <div className="security-info">
                <div className="security-title">Пароль</div>
                <div className="security-description">Последнее изменение: никогда</div>
              </div>
              <button className="button-secondary">Изменить</button>
            </div>

            <div className="security-item">
              <div className="security-info">
                <div className="security-title">Двухфакторная аутентификация</div>
                <div className="security-description">Дополнительная защита аккаунта</div>
              </div>
              <button className="button-secondary">Настроить</button>
            </div>
          </div>
        </div>

        <div className="profile-section">
          <h2 className="section-title">Действия</h2>
          <div className="profile-card">
            <button className="button-danger" onClick={logout}>
              Выйти из аккаунта
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile

