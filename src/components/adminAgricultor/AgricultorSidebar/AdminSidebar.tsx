import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './AdminSidebar.css'

const AgricultorSidebar: React.FC = () => {
  const location = useLocation()
  const { user } = useAuth()

  const isActive = (path: string) => location.pathname === path

  const menuItems = [
    { path: '/agricultor', icon: '📊', label: 'Dashboard' },
    { path: '/agricultor/productos', icon: '🛒', label: 'Mis Productos' },
    { path: '/agricultor/ferias', icon: '🏪', label: 'Mi Feria' },
  ]

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-header">
        <Link to="/" className="admin-sidebar-logo">
          Agro<span>Map</span>
        </Link>
        <div className="admin-sidebar-subtitle">Panel Agricultor</div>
      </div>

      <div className="admin-sidebar-user">
        <div className="admin-sidebar-user-avatar">
          {user?.name?.charAt(0).toUpperCase() || 'A'}
        </div>
        <div className="admin-sidebar-user-info">
          <div className="admin-sidebar-user-name">{user?.name}</div>
          <div className="admin-sidebar-user-role">Agricultor</div>
        </div>
      </div>

      <nav className="admin-sidebar-nav">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`admin-sidebar-link ${isActive(item.path) ? 'active' : ''}`}
          >
            <span className="admin-sidebar-link-icon">{item.icon}</span>
            <span className="admin-sidebar-link-label">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="admin-sidebar-footer">
        <Link to="/" className="admin-sidebar-home-link">
          ← Volver al sitio
        </Link>
      </div>
    </aside>
  )
}

export default AgricultorSidebar
