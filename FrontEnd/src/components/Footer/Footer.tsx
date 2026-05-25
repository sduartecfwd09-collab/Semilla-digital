import React from 'react'
import { Link } from 'react-router-dom'
import { Facebook, Youtube, Globe, Tractor } from 'lucide-react'
import './Footer.css'

const Footer: React.FC = () => {
  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="pn-footer">
      <div className="pn-footer-inner">
        {/* Brand */}
        <div className="pn-footer-brand">
          <Link to="/" className="pn-footer-logo" onClick={handleScrollToTop}>
            <Tractor size={20} strokeWidth={2.2} />
            <span>AgroMap</span>
          </Link>
          <p className="pn-footer-tagline">
            La plataforma oficial para comparar precios y apoyar la producción
            nacional directa de nuestras ferias.
          </p>
          <div className="pn-footer-socials">
            <a href="https://www.facebook.com/CNPCOSTARICA/" target="_blank" rel="noopener noreferrer" className="pn-footer-social-btn" aria-label="Facebook">
              <Facebook size={16} />
            </a>
            <a href="https://www.youtube.com/channel/UC_NJWLYjOSLWRPKoARl1PGw" target="_blank" rel="noopener noreferrer" className="pn-footer-social-btn" aria-label="YouTube">
              <Youtube size={16} />
            </a>
            <a href="https://www.cnp.go.cr" target="_blank" rel="noopener noreferrer" className="pn-footer-social-btn" aria-label="Website">
              <Globe size={16} />
            </a>
          </div>
        </div>

        {/* CNP */}
        <div className="pn-footer-col">
          <h3 className="pn-footer-col-title">Administración Oficial</h3>
          <div className="pn-footer-cnp-badge">CONSEJO NACIONAL DE PRODUCCIÓN (CNP)</div>
          <p className="pn-footer-col-text">
            Herramienta informativa y guía de compras para fomentar el consumo nacional.
          </p>
        </div>

        {/* Navegación */}
        <div className="pn-footer-col">
          <h3 className="pn-footer-col-title">Navegación</h3>
          <ul className="pn-footer-links">
            <li><Link to="/ferias">Ferias del Productor</Link></li>
            <li><Link to="/comparar">Comparar Precios</Link></li>
            <li><Link to="/recetas">Recetas Sugeridas</Link></li>
            <li><Link to="/contacto">Contacto</Link></li>
          </ul>
        </div>

        {/* Legal */}
        <div className="pn-footer-col">
          <h3 className="pn-footer-col-title">Legal</h3>
          <ul className="pn-footer-links">
            <li><a href="#privacidad">Privacidad</a></li>
            <li><a href="#terminos">Términos</a></li>
          </ul>
        </div>
      </div>

      <div className="pn-footer-bottom">
        <p>© {new Date().getFullYear()} AgroMap Costa Rica. Cultivando transparencia.</p>
      </div>
    </footer>
  )
}

export default Footer
