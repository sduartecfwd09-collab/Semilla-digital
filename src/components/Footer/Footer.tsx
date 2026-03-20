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
      <Link to="/" className="footer-logo" onClick={handleScrollToTop}>
        Agro<span>Map</span>
      </Link>
      <p className="footer-copyright">© 2026 AgroMap · AgroFeriados Team · Proyecto Final</p>
    </footer>
  )
}

export default Footer
