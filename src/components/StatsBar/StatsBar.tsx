import React, { useState, useEffect } from 'react'
import { useFerias } from '../../hooks/useFerias'
import './StatsBar.css'
import { ENDPOINTS } from '../../services/api.config'

interface Stat {
  value: string
  label: string
}

const StatsBar: React.FC = () => {
  const { allFerias, loading: loadingFerias } = useFerias()
  const [productCount, setProductCount] = useState(0)
  const [loadingProducts, setLoadingProducts] = useState(true)

  useEffect(() => {
    // Obtenemos la cantidad de productos reales del db.json
    fetch(ENDPOINTS.productos)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const availableCount = data.filter((p: any) => p.disponible !== false).length;
          setProductCount(availableCount)
        }
        setLoadingProducts(false)
      })
      .catch((err) => {
        console.error('Error fetching products for stats:', err)
        setLoadingProducts(false)
      })
  }, [])

  const stats: Stat[] = [
    { 
      value: loadingFerias ? '...' : `${allFerias.length}+`, 
      label: 'Ferias registradas' 
    },
    { 
      value: loadingProducts ? '...' : `${productCount}+`, 
      label: 'Productos disponibles' 
    },
    { 
      value: '7', 
      label: 'Provincias cubiertas' 
    },
    { 
      value: '100%', 
      label: 'Acceso Gratuito' 
    },
  ]

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
