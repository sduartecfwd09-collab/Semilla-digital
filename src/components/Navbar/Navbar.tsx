import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import { useAuth } from '../context/AuthContext'
import './Navbar.css'

const Navbar: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: '¿Cerrar sesión?',
      text: '¿Estás seguro de que deseas salir de tu cuenta?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#2d8a42',
      cancelButtonColor: '#718096',
      confirmButtonText: 'Sí, cerrar sesión',
      cancelButtonText: 'Cancelar'
    })

    if (result.isConfirmed) {
      navigate('/')
      Promise.resolve().then(() => logout())
    }
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

        {/* Enlaces dinámicos según el rol */}
        {user?.role === 'Administrador' && (
          <li>
            <Link to="/admin" className={`navbar-link ${location.pathname.startsWith('/admin') ? 'active' : ''}`}>
              Panel Admin
            </Link>
          </li>
        )}

        {user?.role === 'Agricultor' && (
          <li>
            <Link to="/agricultor" className={`navbar-link ${location.pathname.startsWith('/agricultor') ? 'active' : ''}`}>
              Panel Mi Feria
            </Link>
          </li>
        )}

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
