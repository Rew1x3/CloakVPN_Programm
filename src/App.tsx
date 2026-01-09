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
import Referral from './pages/Referral'
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
        console.log('Starting app load...')
        // Упрощенная загрузка - убираем длительные ожидания
        // Ждем загрузки DOM
        if (document.readyState === 'loading') {
          await new Promise((resolve) => {
            document.addEventListener('DOMContentLoaded', resolve)
          })
        }

        // Минимальная задержка для показа лоадера
        await new Promise((resolve) => setTimeout(resolve, 1000))

        console.log('App loaded, setting isLoading to false')
        setIsLoading(false)
      } catch (error) {
        console.error('Ошибка загрузки:', error)
        // В случае ошибки все равно показываем приложение
        setTimeout(() => setIsLoading(false), 1000)
      }
    }

    loadApp()
  }, [])

  if (isLoading) {
    console.log('App is loading...')
    return <Loader />
  }

  console.log('App loaded, rendering routes')

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
              path="/"
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
                          <Route path="/referral" element={<Referral />} />
                        </Routes>
                      </main>
                    </div>
                  </div>
                </ProtectedRoute>
              }
            />
            <Route
              path="*"
              element={
                <Navigate to="/telegram" replace />
              }
            />
          </Routes>
        </Router>
      </VPNProvider>
    </AuthProvider>
  )
}

export default App
