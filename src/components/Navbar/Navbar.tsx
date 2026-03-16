import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import './Navbar.css'

const Navbar: React.FC = () => {
  const location = useLocation()
  const [user, setUser] = useState<{name: string} | null>(null)

  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      setUser(JSON.parse(userStr))
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('user')
    setUser(null)
    window.location.reload()
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
          {user ? (
            <button className="navbar-cta-logout" onClick={handleLogout}>
              Cerrar sesión
            </button>
          ) : (
            <Link to="/auth" className="navbar-cta">
              Iniciar sesión
            </Link>
          )}
        </li>
      </ul>
    </nav>
  )
}

export default Navbar
