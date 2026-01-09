import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <div>Загрузка...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/telegram" replace />
  }

  return <>{children}</>
}

export default ProtectedRoute


