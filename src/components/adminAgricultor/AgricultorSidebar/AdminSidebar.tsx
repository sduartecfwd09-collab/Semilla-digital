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
    <aside className="agricultor-sidebar">
      <div className="agricultor-sidebar-header">
        <Link to="/" className="agricultor-sidebar-logo">
          Agro<span>Map</span>
        </Link>
        <div className="agricultor-sidebar-subtitle">Panel Agricultor</div>
      </div>

      <div className="agricultor-sidebar-user">
        <div className="agricultor-sidebar-user-avatar">
          {user?.name?.charAt(0).toUpperCase() || 'A'}
        </div>
        <div className="agricultor-sidebar-user-info">
          <div className="agricultor-sidebar-user-name">{user?.name}</div>
          <div className="agricultor-sidebar-user-role">Agricultor</div>
        </div>
      </div>

      <nav className="agricultor-sidebar-nav">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`agricultor-sidebar-link ${isActive(item.path) ? 'active' : ''}`}
          >
            <span className="agricultor-sidebar-link-icon">{item.icon}</span>
            <span className="agricultor-sidebar-link-label">{item.label}</span>
          </Link>
        ))}
      </nav>


    </aside>
  )
}

export default AgricultorSidebar
