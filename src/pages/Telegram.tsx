import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import TelegramAuth from '../components/TelegramAuth'
import './Auth.css'

const Telegram = () => {
  console.log('Telegram component rendering')
  return (
    <div className="auth-page" style={{ minHeight: '100vh', background: '#0F0B1E' }}>
      <div className="auth-background">
        <div className="bg-gradient-1"></div>
        <div className="bg-gradient-2"></div>
      </div>
      <TelegramAuth />
    </div>
  )
}

export default Telegram


