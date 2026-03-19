import React from 'react'
import './FeaturesSection.css'

interface Feature {
  icon: string
  title: string
  description: string
}

const features: Feature[] = [
  {
    icon: '📊',
    title: 'Comparación de precios',
    description:
      'Visualizá el precio de un mismo producto en distintas ferias de tu zona y tomá la mejor decisión antes de ir.',
  },
  {
    icon: '🗺️',
    title: 'Directorio de ferias',
    description:
      'Encontrá ferias del agricultor cerca de vos con información sobre ubicación, horarios y productos disponibles.',
  },
  {
    icon: '🔍',
    title: 'Buscador rápido',
    description:
      'Buscá cualquier producto agrícola y encontrá en qué ferias está disponible y a qué precio aproximado se vende.',
  },
]

const FeaturesSection: React.FC = () => {
  return (
    <section className="features-section">
      <div className="features-label">¿Por qué AgroMap?</div>
      <div className="features-title">
        Todo lo que necesitás para comprar con inteligencia
      </div>
      <div className="features-grid">
        {features.map((feature, index) => (
          <div key={index} className="features-card">
            <div className="features-icon">{feature.icon}</div>
            <h3 className="features-card-title">{feature.title}</h3>
            <p className="features-card-desc">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export default FeaturesSection
