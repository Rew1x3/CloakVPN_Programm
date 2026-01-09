import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import './Referral.css'

interface ReferralStats {
  totalReferrals: number
  activeReferrals: number
  referrals: Array<{
    id: string
    name: string
    username: string | null
    telegram_id: number
    created_at: string
    premium_until: string | null
  }>
}

const Referral = () => {
  const { user } = useAuth()
  const [referralCode, setReferralCode] = useState<string>('')
  const [referralLink, setReferralLink] = useState<string>('')
  const [stats, setStats] = useState<ReferralStats>({
    totalReferrals: 0,
    activeReferrals: 0,
    referrals: []
  })
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    loadReferralData()
  }, [user])

  const loadReferralData = async () => {
    if (!user) return

    try {
      setLoading(true)
      
      // Получаем реферальный код пользователя
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('referral_code, telegram_id')
        .eq('id', user.id)
        .single()

      if (profileError) {
        console.error('Error loading profile:', profileError)
        // Если кода нет, генерируем его
        if (profileError.code === 'PGRST116') {
          await generateReferralCode()
          return
        }
      }

      if (profile?.referral_code) {
        setReferralCode(profile.referral_code)
        const API_URL = import.meta.env.VITE_API_URL || 'https://cloak-vpn.vercel.app'
        setReferralLink(`${API_URL}/register?ref=${profile.referral_code}`)
      } else {
        await generateReferralCode()
      }

      // Загружаем статистику рефералов
      const { data: referrals, error: referralsError } = await supabase
        .from('profiles')
        .select('id, name, telegram_username, telegram_id, created_at, premium_until')
        .eq('referred_by', user.id)
        .order('created_at', { ascending: false })

      if (!referralsError && referrals) {
        const activeReferrals = referrals.filter(r => {
          if (!r.premium_until) return false
          return new Date(r.premium_until) > new Date()
        }).length

        setStats({
          totalReferrals: referrals.length,
          activeReferrals,
          referrals: referrals.map(r => ({
            id: r.id,
            name: r.name || 'User',
            username: r.telegram_username,
            telegram_id: r.telegram_id,
            created_at: r.created_at,
            premium_until: r.premium_until
          }))
        })
      }
    } catch (error) {
      console.error('Error loading referral data:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateReferralCode = async () => {
    if (!user) return

    try {
      // Генерируем уникальный код (8 символов)
      const code = Math.random().toString(36).substring(2, 10).toUpperCase()
      
      // Пробуем сохранить в referrals, если не получится - в profiles
      let saved = false
      
      try {
        const { error: referralsError } = await supabase
          .from('referrals')
          .upsert({
            user_id: user.id,
            referral_code: code,
          }, {
            onConflict: 'user_id'
          })
        
        if (!referralsError) {
          saved = true
        }
      } catch (e) {
        // Таблица referrals не существует
      }
      
      if (!saved) {
        // Пробуем сохранить в profiles
        try {
          const { error: profilesError } = await supabase
            .from('profiles')
            .update({ referral_code: code })
            .eq('id', user.id)
          
          if (profilesError) {
            console.error('Error generating referral code:', profilesError)
            return
          }
        } catch (e) {
          console.error('Error saving referral code:', e)
          return
        }
      }

      setReferralCode(code)
      const API_URL = import.meta.env.VITE_API_URL || 'https://cloak-vpn.vercel.app'
      setReferralLink(`${API_URL}/register?ref=${code}`)
    } catch (error) {
      console.error('Error generating referral code:', error)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="referral-page">
        <div className="loading-state">Загрузка...</div>
      </div>
    )
  }

  return (
    <div className="referral-page">
      <div className="page-header">
        <h1 className="page-title">Реферальная программа</h1>
        <p className="page-subtitle">Приглашайте друзей и получайте премиум</p>
      </div>

      <div className="referral-content">
        {/* Реферальная ссылка */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="referral-card main-card"
        >
          <div className="card-header">
            <h2>Ваша реферальная ссылка</h2>
            <p>Поделитесь этой ссылкой с друзьями и получите 15 дней премиума за каждого приглашенного</p>
          </div>
          <div className="referral-link-section">
            <div className="link-input-wrapper">
              <input
                type="text"
                value={referralLink}
                readOnly
                className="link-input"
              />
              <button
                className={`copy-button ${copied ? 'copied' : ''}`}
                onClick={() => copyToClipboard(referralLink)}
              >
                {copied ? '✓ Скопировано' : 'Копировать'}
              </button>
            </div>
            <div className="referral-code-display">
              <span className="code-label">Код:</span>
              <span className="code-value">{referralCode}</span>
            </div>
          </div>
        </motion.div>

        {/* Статистика */}
        <div className="stats-grid">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="stat-card"
          >
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <div className="stat-value">{stats.totalReferrals}</div>
              <div className="stat-label">Всего приглашено</div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="stat-card"
          >
            <div className="stat-icon">⭐</div>
            <div className="stat-content">
              <div className="stat-value">{stats.activeReferrals}</div>
              <div className="stat-label">Активных рефералов</div>
            </div>
          </motion.div>
        </div>

        {/* Список рефералов */}
        {stats.referrals.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="referrals-list-card"
          >
            <div className="card-header">
              <h2>Ваши рефералы</h2>
              <p>Список пользователей, которые зарегистрировались по вашей ссылке</p>
            </div>
            <div className="referrals-list">
              {stats.referrals.map((referral, index) => (
                <motion.div
                  key={referral.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                  className="referral-item"
                >
                  <div className="referral-avatar">
                    {referral.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="referral-info">
                    <div className="referral-name">
                      {referral.name}
                      {referral.username && (
                        <span className="referral-username">@{referral.username}</span>
                      )}
                    </div>
                    <div className="referral-meta">
                      <span className="referral-date">Зарегистрирован: {formatDate(referral.created_at)}</span>
                      {referral.premium_until && (
                        <span className={`referral-premium ${new Date(referral.premium_until) > new Date() ? 'active' : 'expired'}`}>
                          {new Date(referral.premium_until) > new Date() ? 'Премиум активен' : 'Премиум истек'}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Информация о программе */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="info-card"
        >
          <h3>Как это работает?</h3>
          <ul className="info-list">
            <li>Поделитесь своей реферальной ссылкой с друзьями</li>
            <li>Когда друг зарегистрируется по вашей ссылке, вы получите уведомление в Telegram</li>
            <li>Вы получите <strong>15 дней премиума</strong> за каждого приглашенного</li>
            <li>Ваш друг получит <strong>3 дня бесплатного премиума</strong></li>
            <li>Премиум начисляется автоматически при регистрации</li>
          </ul>
        </motion.div>
      </div>
    </div>
  )
}

export default Referral

