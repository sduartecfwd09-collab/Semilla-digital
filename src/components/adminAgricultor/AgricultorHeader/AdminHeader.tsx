import React from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import './AdminHeader.css'

interface AdminHeaderProps {
  title: string
  subtitle?: string
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ title, subtitle }) => {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="admin-header">
      <div className="admin-header-content">
        <div className="admin-header-text">
          <h1 className="admin-header-title">{title}</h1>
          {subtitle && <p className="admin-header-subtitle">{subtitle}</p>}
        </div>
        <button onClick={handleLogout} className="admin-header-logout">
          Cerrar sesión
        </button>
      </div>
    </header>
  )
}

export default AdminHeader
