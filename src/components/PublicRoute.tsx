import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

interface PublicRouteProps {
  children: React.ReactNode
}

const PublicRoute = ({ children }: PublicRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <div>Загрузка...</div>
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

export default PublicRoute



