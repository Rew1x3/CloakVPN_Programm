import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

interface PublicRouteProps {
  children: React.ReactNode
}

const PublicRoute = ({ children }: PublicRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth()

  console.log('PublicRoute - isLoading:', isLoading, 'isAuthenticated:', isAuthenticated)

  if (isLoading) {
    console.log('PublicRoute - showing loading')
    return <div style={{ color: 'white', padding: '20px', background: '#0F0B1E', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Загрузка...</div>
  }

  if (isAuthenticated) {
    console.log('PublicRoute - redirecting to /')
    return <Navigate to="/" replace />
  }

  console.log('PublicRoute - rendering children')
  return <div style={{ minHeight: '100vh', background: '#0F0B1E' }}>{children}</div>
}

export default PublicRoute



