import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Navbar.css'

const Navbar: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

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
            {/*Productos*/}
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
          {isAuthenticated ? (
            <button className="navbar-cta-logout" onClick={handleLogout}>
              Cerrar sesión ({user?.nombre})
            </button>
          ) : (
            <Link to="/login" className="navbar-cta">
              Iniciar sesión
            </Link>
          )}
        </li>
      </ul>
    </nav>
  )
}

export default Navbar
