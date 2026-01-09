import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Servers from './pages/Servers'
import Settings from './pages/Settings'
import Statistics from './pages/Statistics'
import Login from './pages/Login'
import Register from './pages/Register'
import Telegram from './pages/Telegram'
import Profile from './pages/Profile'
import Sidebar from './components/Sidebar'
import TitleBar from './components/TitleBar'
import Loader from './components/Loader'
import ProtectedRoute from './components/ProtectedRoute'
import PublicRoute from './components/PublicRoute'
import { VPNProvider } from './context/VPNContext'
import { AuthProvider } from './context/AuthContext'
import './App.css'

function App() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadApp = async () => {
      try {
        // Ждем загрузки DOM
        if (document.readyState === 'loading') {
          await new Promise((resolve) => {
            document.addEventListener('DOMContentLoaded', resolve)
          })
        }

        // Ждем загрузки всех изображений
        const images = document.querySelectorAll('img')
        const imagePromises = Array.from(images).map((img) => {
          if (img.complete) return Promise.resolve()
          return new Promise((resolve, reject) => {
            img.onload = resolve
            img.onerror = resolve // Продолжаем даже если изображение не загрузилось
            setTimeout(resolve, 2000) // Таймаут на случай проблем
          })
        })

        await Promise.all(imagePromises)

        // Ждем загрузки шрифтов
        if (document.fonts && document.fonts.ready) {
          await document.fonts.ready
        }

        // Минимальное время для показа лоадера (чтобы пользователь увидел анимацию)
        const minLoadTime = 2000
        const startTime = Date.now()
        
        await Promise.all([
          new Promise((resolve) => setTimeout(resolve, minLoadTime))
        ])

        const elapsed = Date.now() - startTime
        if (elapsed < minLoadTime) {
          await new Promise((resolve) => setTimeout(resolve, minLoadTime - elapsed))
        }

        // Дополнительная небольшая задержка для плавности
        await new Promise((resolve) => setTimeout(resolve, 300))

        setIsLoading(false)
      } catch (error) {
        console.error('Ошибка загрузки:', error)
        // В случае ошибки все равно показываем приложение
        setTimeout(() => setIsLoading(false), 2000)
      }
    }

    loadApp()
  }, [])

  if (isLoading) {
    return <Loader />
  }

  return (
    <AuthProvider>
      <VPNProvider>
        <Router>
          <Routes>
            <Route
              path="/telegram"
              element={
                <PublicRoute>
                  <Telegram />
                </PublicRoute>
              }
            />
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              }
            />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <div className="app-container">
                    <TitleBar />
                    <div className="app-content">
                      <Sidebar />
                      <main className="main-content">
                        <Routes>
                          <Route path="/" element={<Home />} />
                          <Route path="/servers" element={<Servers />} />
                          <Route path="/settings" element={<Settings />} />
                          <Route path="/statistics" element={<Statistics />} />
                          <Route path="/profile" element={<Profile />} />
                        </Routes>
                      </main>
                    </div>
                  </div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </VPNProvider>
    </AuthProvider>
  )
}

export default App
