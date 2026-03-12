import React from 'react'
import './FeriasGrid.css'

interface Feria {
  emoji: string
  name: string
  location: string
  schedule: string
  productCount: number
  gradientFrom?: string
  gradientTo?: string
}

const ferias: Feria[] = [
  {
    emoji: '🏪',
    name: 'Feria de Pavas',
    location: 'San José',
    schedule: 'Sábados 6am–12pm',
    productCount: 32,
  },
  {
    emoji: '🌾',
    name: 'Feria de Cartago',
    location: 'Cartago',
    schedule: 'Sábados y Domingos',
    productCount: 28,
  },
  {
    emoji: '🥬',
    name: 'Feria de Heredia',
    location: 'Heredia',
    schedule: 'Sábados 5am–11am',
    productCount: 25,
  },
  {
    emoji: '🍋',
    name: 'Feria de Alajuela',
    location: 'Alajuela',
    schedule: 'Viernes y Sábados',
    productCount: 30,
  },
]

const FeriasGrid: React.FC = () => {
  return (
    <section id="ferias" className="ferias-grid-section">
      <div className="ferias-label">Ferias disponibles</div>
      <div className="ferias-title">Explorá las ferias más cercanas</div>
      <div className="ferias-grid">
        {ferias.map((feria, index) => (
          <div key={index} className="feria-card">
            <div className="feria-card-img">{feria.emoji}</div>
            <div className="feria-card-info">
              <h4 className="feria-card-title">{feria.name}</h4>
              <p className="feria-card-meta">
                📍 {feria.location} · {feria.schedule}
              </p>
              <span className="feria-card-badge">{feria.productCount} productos</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default FeriasGrid
