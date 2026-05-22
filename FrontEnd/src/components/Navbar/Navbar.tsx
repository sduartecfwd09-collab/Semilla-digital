import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import CartDrawer from '../Cart/CartDrawer'
import './Navbar.css'
import { ENDPOINTS } from '../../services/api.config'

const Navbar: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()
  const { getItemCount, setIsCartOpen } = useCart()
  const [menuOpen, setMenuOpen] = useState(false)

  // Close menu on route change
  useEffect(() => {
    const handle = requestAnimationFrame(() => {
      setMenuOpen(false)
    })
    return () => cancelAnimationFrame(handle)
  }, [location.pathname])

  // Close menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setMenuOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  const [hasProfileNotif, setHasProfileNotif] = useState(false)
  const [hasContactNotif, setHasContactNotif] = useState(false)

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

  useEffect(() => {
    const checkNotifications = async () => {
      // 1. Solicitudes de cambio de rol (perfil)
      if (user) {
        try {
          const res = await fetch(ENDPOINTS.solicitudesCambioRol)
          const data = await res.json()
          const myResponses = data.filter((s: any) => 
            String(s.usuarioId) === String(user.id) && s.estado !== 'Pendiente'
          )
          if (myResponses.length > 0) {
            const latest = myResponses.sort((a: any, b: any) => 
              new Date(b.fechaRespuesta || b.fechaSolicitud).getTime() - new Date(a.fechaRespuesta || a.fechaSolicitud).getTime()
            )[0]
            const seenId = localStorage.getItem(`seen_sol_${user.id}`)
            
            if (location.pathname === '/perfil') {
              // Si está en el perfil, marcar como leída inmediatamente
              localStorage.setItem(`seen_sol_${user.id}`, latest.id)
              setHasProfileNotif(false)
            } else if (seenId !== latest.id) {
              setHasProfileNotif(true)
            }
          }
        } catch (e) {
          console.error(e)
        }
      }

      // 2. Mensajes de contacto
      try {
        const res = await fetch(ENDPOINTS.contactMessages)
        const data = await res.json()
        const savedIds: string[] = JSON.parse(localStorage.getItem('agromap_my_messages') || '[]')
        
        const myResponded = data.filter((m: any) => {
          const matchedByEmail = user?.email && m.correo && 
                                m.correo.toLowerCase() === user.email.toLowerCase()
          const matchedByLocal = m.id && savedIds.includes(m.id)
          return (matchedByEmail || matchedByLocal) && m.estado === 'Respondido'
        })

        if (myResponded.length > 0) {
          const latest = myResponded.sort((a: any, b: any) => 
            new Date(b.fechaRespuesta || b.fechaEnvio).getTime() - new Date(a.fechaRespuesta || a.fechaEnvio).getTime()
          )[0]
          const seenKey = user ? `seen_msg_${user.id}` : 'seen_msg_anon'
          const seenId = localStorage.getItem(seenKey)

          if (location.pathname === '/contacto') {
            // Si está en contacto, marcar como leída inmediatamente
            localStorage.setItem(seenKey, latest.id)
            setHasContactNotif(false)
          } else if (seenId !== latest.id) {
            setHasContactNotif(true)
          } else {
            setHasContactNotif(false)
          }
        } else {
          setHasContactNotif(false)
        }
      } catch (e) {
        console.error(e)
      }
    }

    checkNotifications()
  }, [user, location.pathname])

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo" onClick={handleScrollToTop}>
        Agro<span>Map</span>
      </Link>

      {/* Hamburger button — visible only on mobile/tablet */}
      <button
        className={`navbar-hamburger ${menuOpen ? 'active' : ''}`}
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <ul className={`navbar-links ${menuOpen ? 'open' : ''}`}>
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
            {hasContactNotif && user?.role !== 'Administrador' && <span className="navbar-dot"></span>}
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

        {user?.role === 'Productor' && (
          <li>
            <Link to="/productor" className={`navbar-link ${location.pathname.startsWith('/productor') ? 'active' : ''}`}>
              Panel Mi Feria
            </Link>
          </li>
        )}

        {user && (
          <li className="navbar-item-perfil" style={{ zIndex: 110 }}>
            <Link 
              to="/perfil" 
              className={`navbar-link ${location.pathname === '/perfil' ? 'active' : ''}`} 
              style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
            >
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
                border: '1px solid rgba(255,255,255,0.3)',
                color: 'white',
                pointerEvents: 'none'
              }}>
                {user.avatar ? (
                  <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  (user.name || user.nombre || 'U').charAt(0).toUpperCase()
                )}
              </div>
              Perfil
              {hasProfileNotif && user?.role !== 'Administrador' && <span className="navbar-dot"></span>}
            </Link>
          </li>
        )}

        {/* Cart Icon */}
        <li>
          <button className="navbar-cart-btn" onClick={() => setIsCartOpen(true)} aria-label="Abrir carrito" style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative', fontSize: '1.2rem', padding: '0.5rem' }}>
            🛒
            {getItemCount() > 0 && (
              <span style={{ position: 'absolute', top: 0, right: 0, background: '#e11d48', color: 'white', fontSize: '0.65rem', fontWeight: 'bold', width: '1.1rem', height: '1.1rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {getItemCount()}
              </span>
            )}
          </button>
        </li>

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
      <CartDrawer />
    </nav>
  )
}

export default Navbar
