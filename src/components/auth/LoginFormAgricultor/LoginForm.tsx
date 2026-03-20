import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './LoginForm.css'

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const success = await login(email, password)
      if (success) {
        navigate('/admin')
      } else {
        setError('Email o contraseña incorrectos')
      }
    } catch {
      setError('Error al iniciar sesión. Intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-form-container">
      <div className="login-form-card">
        <div className="login-form-header">
          <h2>Iniciar Sesión</h2>
          <p>Panel de Administración - Feriante</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="login-form-error">{error}</div>}

          <div className="login-form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
            />
          </div>

          <div className="login-form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="login-form-button" disabled={loading}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>

          <div className="login-form-footer">
            <p>
              ¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link>
            </p>
            <p>
              <Link to="/">← Volver al inicio</Link>
            </p>
          </div>

          <div className="login-form-demo">
            <p><strong>Usuario de prueba:</strong></p>
            <p>Email: admin@feria.com</p>
            <p>Contraseña: admin123</p>
          </div>
        </form>
      </div>
    </div>
  )
}

export default LoginForm
