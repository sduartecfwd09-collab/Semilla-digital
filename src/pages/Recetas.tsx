import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Recipes from '../components/Recipes'
import './Pages.css'

const RecetasPage: React.FC = () => {
  const [isJoined, setIsJoined] = useState(false)

  useEffect(() => {
    const user = localStorage.getItem('user')
    if (user) {
      setIsJoined(true)
    }
  }, [])

  return (
    <div className="recetas-page page-container">
      <Navbar />
      
      {isJoined ? (
        <Recipes />
      ) : (
        <div className="content-barrier">
          <div className="barrier-icon">🔒🥗</div>
          <h1 className="barrier-title">
            Desbloqueá Nuestras Recetas
          </h1>
          <p className="barrier-text">
            Para ver nuestras mejores recetas saludables con ingredientes de la feria, necesitás tener una cuenta en AgroMap. ¡Es gratis y solo te tomará un minuto!
          </p>
          <div className="barrier-actions">
            <Link to="/auth" className="navbar-cta" style={{ textDecoration: 'none', padding: '1rem 2.5rem', fontSize: '1.1rem' }}>
              Registrarse ahora
            </Link>
            <Link to="/" className="action-link">
              Volver al inicio
            </Link>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}

export default RecetasPage
