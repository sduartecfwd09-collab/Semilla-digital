import React from 'react'
import { Link } from 'react-router-dom'
import { Facebook, Youtube, Globe, ArrowUp } from 'lucide-react'
import './Footer.css'

const Footer: React.FC = () => {
  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="footer">
      <div className="footer-content">
        {/* Branding Section */}
        <div className="footer-brand">
          <Link to="/" className="footer-logo" onClick={handleScrollToTop}>
            <span className="footer-logo-agro">Agro</span>
            <span className="footer-logo-map">Map</span>
          </Link>
          <p className="footer-tagline">
            La plataforma oficial para comparar precios y apoyar la producción nacional directa de nuestras ferias.
          </p>
          <div className="social-links">
            <a href="https://www.facebook.com/CNPCOSTARICA/" target="_blank" rel="noopener noreferrer" className="social-btn" aria-label="Facebook">
              <Facebook size={18} />
            </a>
            <a href="https://www.youtube.com/channel/UC_NJWLYjOSLWRPKoARl1PGw" target="_blank" rel="noopener noreferrer" className="social-btn" aria-label="YouTube">
              <Youtube size={18} />
            </a>
            <a href="https://www.cnp.go.cr" target="_blank" rel="noopener noreferrer" className="social-btn" aria-label="Website">
              <Globe size={18} />
            </a>
          </div>
        </div>

        {/* Administration Info */}
        <div className="footer-cnp-info">
          <h3 className="footer-section-title">Administración Oficial</h3>
          <div className="cnp-badge">Consejo Nacional de Producción (CNP)</div>
          <p className="footer-cnp-text">
            Este sitio web es una herramienta informativa y guía de compras administrada por el 
            <strong> CNP</strong>. Nuestro objetivo es fomentar el consumo de productos nacionales 
            y fortalecer la economía rural en Costa Rica.
          </p>
        </div>

        {/* Quick Links */}
        <div className="footer-social">
          <h3 className="footer-section-title">Navegación</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li><Link to="/ferias" style={{ color: 'inherit', textDecoration: 'none', fontSize: '14px', opacity: 0.8 }}>Ferias del Agricultor</Link></li>
            <li><Link to="/comparar" style={{ color: 'inherit', textDecoration: 'none', fontSize: '14px', opacity: 0.8 }}>Comparar Precios</Link></li>
            <li><Link to="/recetas" style={{ color: 'inherit', textDecoration: 'none', fontSize: '14px', opacity: 0.8 }}>Recetas Sugeridas</Link></li>
            <li><Link to="/contacto" style={{ color: 'inherit', textDecoration: 'none', fontSize: '14px', opacity: 0.8 }}>Contacto</Link></li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <p className="footer-copyright">
          © {new Date().getFullYear()} AgroMap · Costa Rica · Proyecto Final de Graduación
        </p>
        <div className="footer-meta">
          <span>AgroFeriados Team</span>
          <button 
            onClick={handleScrollToTop} 
            className="scroll-top-btn" 
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'var(--footer-accent)', 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '4px',
              fontFamily: 'inherit',
              fontSize: '13px'
            }}
          >
            Volver arriba <ArrowUp size={14} />
          </button>
        </div>
      </div>
    </footer>
  )
}

export default Footer
