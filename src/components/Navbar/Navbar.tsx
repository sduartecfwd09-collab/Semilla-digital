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
        <li>
          <Link to="/contacto" className={`navbar-link ${isActive('/contacto') ? 'active' : ''}`}>
            Contáctanos
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
            <Link to="/perfil" className={`navbar-link ${isActive('/perfil') ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="navbar-avatar-mini" style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 'bold',
                overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.3)'
              }}>
                {user.avatar ? (
                  <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  user.name ? user.name.charAt(0).toUpperCase() : 'U'
                )}
              </div>
              Perfil
            </Link>
          </li>
        )}

        <li>
          {user ? (
            <button className="navbar-cta-logout" onClick={handleLogout} title="Cerrar sesión">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
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
