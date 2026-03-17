import React from 'react'
import './AdminStats.css'

interface StatCardProps {
  icon: string
  label: string
  value: string | number
  color: string
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, color }) => {
  return (
    <div className="admin-stat-card" style={{ borderLeftColor: color }}>
      <div className="admin-stat-icon" style={{ background: `${color}15` }}>
        {icon}
      </div>
      <div className="admin-stat-content">
        <div className="admin-stat-label">{label}</div>
        <div className="admin-stat-value">{value}</div>
      </div>
    </div>
  )
}

interface AdminStatsProps {
  stats: {
    totalProductos: number
    productosActivos: number
    feriaNombre: string
    puestoNumero: string
  }
}

const AdminStats: React.FC<AdminStatsProps> = ({ stats }) => {
  return (
    <div className="admin-stats-grid">
      <StatCard
        icon="📦"
        label="Total Productos"
        value={stats.totalProductos}
        color="var(--verde)"
      />
      <StatCard
        icon="✅"
        label="Productos Activos"
        value={stats.productosActivos}
        color="var(--lima)"
      />
      <StatCard
        icon="🏪"
        label="Feria"
        value={stats.feriaNombre}
        color="var(--tierra)"
      />
      <StatCard
        icon="📍"
        label="Puesto"
        value={stats.puestoNumero}
        color="var(--verde-claro)"
      />
    </div>
  )
}

export default AdminStats
