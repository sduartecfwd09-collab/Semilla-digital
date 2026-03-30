import React, { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import Swal from 'sweetalert2'
import './LoginYRegistro.css'
import { useNavigate, Link } from 'react-router-dom'
import { validateEmail } from '../../utils/validation'
import { ENDPOINTS } from '../../services/api.config'
import { useAuth } from '../context/AuthContext'


const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true)
  const navigate = useNavigate()
  const { login } = useAuth()

  // Estado del formulario de inicio de sesión
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // Estado del formulario de registro
  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regConfirm, setRegConfirm] = useState('')
  // Estado de visibilidad de contraseñas
  const [showLoginPass, setShowLoginPass] = useState(false)
  const [showRegPass, setShowRegPass] = useState(false)
  const [showRegConfirm, setShowRegConfirm] = useState(false)


  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!loginEmail.trim() || !loginPassword.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Por favor, ingresá tu correo y contraseña.',
        confirmButtonColor: 'var(--verde-claro)',
      })
      return
    }

    if (loginPassword.length <= 6) {
      Swal.fire({
        icon: 'warning',
        title: 'Contraseña inválida',
        text: 'La contraseña debe tener más de 6 caracteres.',
        confirmButtonColor: 'var(--verde-claro)',
      })
      return
    }
    
    try {
      const result = await login(loginEmail, loginPassword)

      if (result.success) {
        Swal.fire({
          icon: 'success',
          title: '¡Bienvenido a AgroMap!',
          text: 'Has iniciado sesión correctamente.',
          confirmButtonColor: 'var(--verde-claro)',
          timer: 2000,
          showConfirmButton: false,
        }).then(() => {
          if (result.role === 'Administrador' || result.role === 'Admin') {
            navigate('/admin')
          } else if (result.role === 'Agricultor' || result.role === 'Vendedor') {
            navigate('/agricultor')
          } else {
            navigate('/')
          }
        })
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Credenciales incorrectas',
          text: 'El correo electrónico o la contraseña no coinciden. O quizá aún no te has registrado.',
          confirmButtonColor: 'var(--verde-claro)',
        })
      }
    } catch (error) {
      console.error('Error en login:', error)
      Swal.fire({
        icon: 'error',
        title: 'Error de servidor',
        text: 'Hubo un problema al conectar con el servidor.',
        confirmButtonColor: 'var(--verde-claro)',
      })
    }
  }

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedName = regName.trim()
    const trimmedEmail = regEmail.trim()
    const trimmedPassword = regPassword.trim()
    const trimmedConfirm = regConfirm.trim()

    if (!trimmedName || !trimmedEmail || !trimmedPassword || !trimmedConfirm) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Por favor, completá todos los datos para registrarte.',
        confirmButtonColor: 'var(--verde-claro)',
      })
      return
    }

    if (trimmedPassword.length <= 6) {
      Swal.fire({
        icon: 'warning',
        title: 'Contraseña insegura',
        text: 'La contraseña debe tener más de 6 dígitos de longitud.',
        confirmButtonColor: 'var(--verde-claro)',
      })
      return
    }

    if (trimmedPassword !== trimmedConfirm) {
      Swal.fire({
        icon: 'error',
        title: 'Error de contraseña',
        text: 'Las contraseñas no coinciden.',
        confirmButtonColor: 'var(--verde-claro)',
      })
      return
    }

    const emailValidation = validateEmail(trimmedEmail);
    if (!emailValidation.valid) {
      Swal.fire({
        icon: 'error',
        title: 'Correo inválido',
        text: emailValidation.message,
        confirmButtonColor: 'var(--verde-claro)',
      })
      return
    }

    try {
      // Verificamos si el correo ya existe (para evitar duplicados)
      const resCheck = await fetch(`${ENDPOINTS.usuarios}`)
      const allUsers = await resCheck.json()
      
      const emailExists = allUsers.some((u: { email: string }) => u.email.toLowerCase() === trimmedEmail.toLowerCase())
      if (emailExists) {
        Swal.fire({
          icon: 'error',
          title: 'Correo en uso',
          text: 'Ya existe una cuenta registrada con este correo electrónico.',
          confirmButtonColor: 'var(--verde-claro)',
        })
        return
      }

      // Creamos el nuevo usuario
      const response = await fetch(`${ENDPOINTS.usuarios}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: trimmedName,
          email: trimmedEmail,
          password: trimmedPassword,
          role: 'Usuario',
          status: 'Activo'
        })
      })

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: '¡Cuenta creada!',
          text: 'Tu cuenta ha sido creada exitosamente. Ahora podés iniciar sesión.',
          confirmButtonColor: 'var(--verde-claro)',
          timer: 2500,
          showConfirmButton: false,
        }).then(() => {
          // Redirigir al formulario de login (cambiando el estado isLogin a true)
          setIsLogin(true)
        })
      }
    } catch (error) {
      console.error('Error en registro:', error)
      Swal.fire({
        icon: 'error',
        title: 'Error de servidor',
        text: 'Hubo un problema al conectar con el servidor para registrarte.',
        confirmButtonColor: 'var(--verde-claro)',
      })
    }
  }


  return (
    <div className="auth-container">
      {/* SECCIÓN IZQUIERDA */}
      <div className="auth-left">
        <Link to="/" className="auth-back-btn" style={{ marginTop: 0, marginBottom: '2rem' }}>
          <span>←</span> Volver al inicio
        </Link>

        <Link to="/" className="auth-logo-link">
          <div className="auth-logo">
            <span className="logo-agro">Agro</span><span className="logo-map">Map</span>
          </div>
        </Link>

        <h1 className="auth-title">
          Comprá con <span className="highlight-green">inteligencia</span><br />
          en las ferias.
        </h1>
        <p className="auth-description">
          Accedé a precios actualizados, comparaciones en tiempo real y toda la información que necesitás para aprovechar al máximo las ferias del agricultor.
        </p>

        <div className="auth-features">
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <div>
              <h3>Comparación de precios</h3>
              <p>Visualizá cuánto cuesta cada producto en diferentes ferias</p>
            </div>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🗺️</div>
            <div>
              <h3>Directorio de ferias</h3>
              <p>Encontrá ferias cercanas con información actualizada</p>
            </div>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💰</div>
            <div>
              <h3>Ahorrá en cada compra</h3>
              <p>Tomá decisiones informadas y optimizá tu presupuesto</p>
            </div>
          </div>
        </div>

      </div>

      {/* SECCIÓN DERECHA */}
      <div className="auth-right">
        <div className="auth-card">
          {/* Botones de alternancia */}
          <div className="auth-toggle">
            <button 
              className={`toggle-btn ${isLogin ? 'active' : ''}`}
              onClick={() => setIsLogin(true)}
              type="button"
            >
              Iniciar sesión
            </button>
            <button 
              className={`toggle-btn ${!isLogin ? 'active' : ''}`}
              onClick={() => setIsLogin(false)}
              type="button"
            >
              Registrarse
            </button>
          </div>

          {isLogin ? (
            /* FORMULARIO DE INICIO DE SESIÓN */
            <div className="auth-form-wrapper animate-fade">
              <h2>Bienvenido/a de vuelta</h2>
              <p className="auth-subtitle">Ingresá tus datos para continuar</p>

              <form onSubmit={handleLoginSubmit}>
                <div className="input-group">
                  <label>Correo electrónico</label>
                  <div className="input-box">
                    <span className="input-icon">✉️</span>
                    <input 
                      type="email" 
                      placeholder="ejemplo@correo.com" 
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value.trim())}
                      autoComplete="username"
                      required
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label>Contraseña</label>
                  <div className="input-box">
                    <span className="input-icon">🔒</span>
                    <input 
                      type={showLoginPass ? "text" : "password"} 
                      placeholder="••••••••" 
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value.trim())}
                      autoComplete="current-password"
                      required
                    />
                    <button 
                      type="button" 
                      className="password-toggle"
                      onClick={() => setShowLoginPass(!showLoginPass)}
                    >
                      {showLoginPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button type="submit" className="auth-submit-btn">
                  Ingresar a AgroMap
                </button>
              </form>

              <div className="auth-separator">
                <span>o continuá con</span>
              </div>

              <p className="auth-switch-text">
                ¿No tenés cuenta?{' '}
                <button className="auth-link-btn" onClick={() => setIsLogin(false)}>
                  Registrate gratis
                </button>
              </p>
            </div>
          ) : (
            /* FORMULARIO DE REGISTRO */
            <div className="auth-form-wrapper animate-fade">
              <h2>Crear una cuenta</h2>
              <p className="auth-subtitle">Completá los datos para unirte</p>

              <form onSubmit={handleRegisterSubmit}>
                <div className="input-group">
                  <label>Nombre completo</label>
                  <div className="input-box">
                    <span className="input-icon">👤</span>
                    <input 
                      type="text" 
                      placeholder="Juan Pérez" 
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      autoComplete="name"
                      required
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label>Correo electrónico</label>
                  <div className="input-box">
                    <span className="input-icon">✉️</span>
                    <input 
                      type="email" 
                      placeholder="ejemplo@correo.com" 
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value.trim())}
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label>Contraseña</label>
                  <div className="input-box">
                    <span className="input-icon">🔒</span>
                    <input 
                      type={showRegPass ? "text" : "password"} 
                      placeholder="••••••••" 
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      autoComplete="new-password"
                    />
                    <button 
                      type="button" 
                      className="password-toggle"
                      onClick={() => setShowRegPass(!showRegPass)}
                    >
                      {showRegPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="input-group">
                  <label>Confirmar contraseña</label>
                  <div className="input-box">
                    <span className="input-icon">🔒</span>
                    <input 
                      type={showRegConfirm ? "text" : "password"} 
                      placeholder="••••••••" 
                      value={regConfirm}
                      onChange={(e) => setRegConfirm(e.target.value)}
                      autoComplete="new-password"
                    />
                    <button 
                      type="button" 
                      className="password-toggle"
                      onClick={() => setShowRegConfirm(!showRegConfirm)}
                    >
                      {showRegConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button type="submit" className="auth-submit-btn">
                  Registrarse
                </button>
              </form>

              <div className="auth-separator">
                <span>o continuá con</span>
              </div>

              <p className="auth-switch-text">
                ¿Ya tenés cuenta?{' '}
                <button className="auth-link-btn" onClick={() => setIsLogin(true)}>
                  Iniciar sesión
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Auth
