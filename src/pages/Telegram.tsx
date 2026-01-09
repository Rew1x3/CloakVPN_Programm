import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import TelegramAuth from '../components/TelegramAuth'
import './Auth.css'

const Telegram = () => {
  return (
    <div className="auth-page">
      <div className="auth-background">
        <div className="bg-gradient-1"></div>
        <div className="bg-gradient-2"></div>
      </div>
      <TelegramAuth />
    </div>
  )
}

export default Telegram


