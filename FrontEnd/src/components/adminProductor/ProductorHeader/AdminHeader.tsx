import React from 'react'
import './AdminHeader.css'

interface AdminHeaderProps {
  title: string
  subtitle?: string
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ title, subtitle }) => {
  return (
    <header className="admin-header">
      <div className="admin-header-content">
        <div className="admin-header-text">
          <h1 className="admin-header-title">{title}</h1>
          {subtitle && <p className="admin-header-subtitle">{subtitle}</p>}
        </div>
      </div>
    </header>
  )
}

export default AdminHeader
