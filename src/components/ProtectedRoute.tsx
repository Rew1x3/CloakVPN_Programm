import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useEffect } from 'react'

interface ProtectedRouteProps {
  children: React.ReactNode
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth()
  const navigate = useNavigate()

  console.log('ProtectedRoute - isLoading:', isLoading, 'isAuthenticated:', isAuthenticated)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      console.log('ProtectedRoute - useEffect: redirecting to /telegram')
      navigate('/telegram', { replace: true })
    }
  }, [isLoading, isAuthenticated, navigate])

  if (isLoading) {
    console.log('ProtectedRoute - showing loading')
    return <div style={{ color: 'white', padding: '20px', background: '#0F0B1E', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Загрузка...</div>
  }

  if (!isAuthenticated) {
    console.log('ProtectedRoute - not authenticated, showing redirect message')
    return <div style={{ color: 'white', padding: '20px', background: '#0F0B1E', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Перенаправление...</div>
  }

  console.log('ProtectedRoute - rendering children')
  return <>{children}</>
}

export default ProtectedRoute
