import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import './Navbar.css'

const Navbar: React.FC = () => {
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">
        Agro<span>Map</span>
      </Link>

      <ul className="navbar-links">
        <li>
          <Link to="/" className={`navbar-link ${isActive('/') ? 'active' : ''}`}>
            Inicio
          </Link>
        </li>
        <li>
          <Link to="/comparar" className={`navbar-link ${isActive('/comparar') ? 'active' : ''}`}>
            Productos
          </Link>
        </li>
        <li>
          <Link to="/" className="navbar-link">
            Ferias
          </Link>
        </li>
        <li>
          <Link to="/comparar" className={`navbar-link ${isActive('/comparar') ? 'active' : ''}`}>
            Comparar
          </Link>
        </li>
        <li>
          <a href="#" className="navbar-cta">
            Iniciar sesión
          </a>
        </li>
      </ul>
    </nav>
  )
}

export default Navbar
