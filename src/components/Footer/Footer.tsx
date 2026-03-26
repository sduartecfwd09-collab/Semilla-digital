import React from 'react'
import { Link } from 'react-router-dom'
import './Footer.css'

const Footer: React.FC = () => {
  const handleScrollToTop = () => {
    if (window.location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-brand">
          <Link to="/" className="footer-logo" onClick={handleScrollToTop}>
            Agro<span>Map</span>
          </Link>
          <p className="footer-tagline">Conectando agricultores y consumidores.</p>
        </div>
        
        <div className="footer-cnp-border"></div>

        <div className="footer-cnp-info">
          <div className="cnp-badge">Administración Oficial</div>
          <p>Este sitio web es una guía de compras administrada por el <strong>Consejo Nacional de Producción (CNP)</strong>.</p>
          
          <div className="footer-cnp-links">
            <span>Canales Oficiales CNP:</span>
            <div className="social-links">
              <a href="https://www.facebook.com/CNPCOSTARICA/" target="_blank" rel="noopener noreferrer" className="social-btn facebook">
                Facebook
              </a>
              <a href="https://www.youtube.com/channel/UC_NJWLYjOSLWRPKoARl1PGw" target="_blank" rel="noopener noreferrer" className="social-btn youtube">
                YouTube
              </a>
            </div>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p className="footer-copyright">© {new Date().getFullYear()} AgroMap · AgroFeriados Team · Proyecto Final</p>
        <div className="footer-policies">
          <span>Costa Rica</span>
        </div>
      </div>
    </footer>
  )
}

export default Footer
