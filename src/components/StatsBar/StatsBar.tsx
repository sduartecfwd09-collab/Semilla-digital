import React from 'react'
import './StatsBar.css'

interface Stat {
  value: string
  label: string
}

const stats: Stat[] = [
  { value: '24+', label: 'Ferias registradas' },
  { value: '120+', label: 'Productos disponibles' },
  { value: '7', label: 'Provincias cubiertas' },
  { value: '100%', label: 'Gratuito para usuarios' },
]

const StatsBar: React.FC = () => {
  return (
    <div className="stats-bar">
      {stats.map((stat, index) => (
        <div key={index} className="stat-item">
          <div className="stat-value">{stat.value}</div>
          <div className="stat-label">{stat.label}</div>
        </div>
      ))}
    </div>
  )
}

export default StatsBar
