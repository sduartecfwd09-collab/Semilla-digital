import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import './Navbar.css'

const Navbar: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [user, setUser] = useState<{name: string} | null>(null)

  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      setUser(JSON.parse(userStr))
    } else {
      setUser(null)
    }
  }, [location.pathname]) // Atualizar quando mudamos de página ou logout

  const handleLogout = () => {
    localStorage.removeItem('user')
    setUser(null)
    navigate('/')
  }

  const isActive = (path: string) => location.pathname === path

  const handleScrollToTop = () => {
    if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo" onClick={handleScrollToTop}>
        Agro<span>Map</span>
      </Link>

      <ul className="navbar-links">
        <li>
          <Link 
            to="/" 
            className={`navbar-link ${isActive('/') ? 'active' : ''}`}
            onClick={handleScrollToTop}
          >
            Inicio
          </Link>
        </li>
        <li>
          <Link 
            to="/ferias" 
            className={`navbar-link ${isActive('/ferias') ? 'active' : ''}`}
          >
            Ferias
          </Link>
        </li>
        <li>
          <Link to="/comparar" className={`navbar-link ${isActive('/comparar') ? 'active' : ''}`}>
            Productos
          </Link>
        </li>
        <li>
          <Link to="/recetas" className={`navbar-link ${isActive('/recetas') ? 'active' : ''}`}>
            Recetas
          </Link>
        </li>
        {user && (
          <li>
            <Link to="/perfil" className={`navbar-link ${isActive('/perfil') ? 'active' : ''}`}>
              Perfil
            </Link>
          </li>
        )}
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
