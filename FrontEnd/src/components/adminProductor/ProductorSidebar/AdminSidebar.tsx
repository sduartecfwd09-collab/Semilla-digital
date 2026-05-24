import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './AdminSidebar.css'

const ProductorSidebar: React.FC = () => {
  const location = useLocation()
  const { user } = useAuth()

  const isActive = (path: string) => location.pathname === path

  const menuItems = [
    { path: '/productor', icon: '📊', label: 'Dashboard' },
    { path: '/productor/productos', icon: '🛒', label: 'Mis Productos' },
    { path: '/productor/ferias', icon: '🏪', label: 'Mi Feria' },
    { path: '/productor/ganancias', icon: '💰', label: 'Ganancias' },
  ]

  return (
    <aside className="productor-sidebar">
      <div className="productor-sidebar-header">
        <Link to="/" className="productor-sidebar-logo">
          Agro<span>Map</span>
        </Link>
        <div className="productor-sidebar-subtitle">Panel Productor</div>
      </div>

      <div className="productor-sidebar-user">
        <div className="productor-sidebar-user-avatar">
          {user?.name?.charAt(0).toUpperCase() || 'A'}
        </div>
        <div className="productor-sidebar-user-info">
          <div className="productor-sidebar-user-name">{user?.name}</div>
          <div className="productor-sidebar-user-role">Productor</div>
        </div>
      </div>

      <nav className="productor-sidebar-nav">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`productor-sidebar-link ${isActive(item.path) ? 'active' : ''}`}
          >
            <span className="productor-sidebar-link-icon">{item.icon}</span>
            <span className="productor-sidebar-link-label">{item.label}</span>
          </Link>
        ))}
      </nav>


    </aside>
  )
}

export default ProductorSidebar
