import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../components/context/AuthContext'
import './ProtectedRoute.css'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: string[]
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="loading-container">
        Cargando...
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />
  }

<<<<<<< HEAD
  // Si hay roles permitidos, verificar que el usuario tenga uno de ellos
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />
  }

=======
>>>>>>> 4325f1856665e17db6cd392cc18ba9518db22206
  return <>{children}</>
}

export default ProtectedRoute
