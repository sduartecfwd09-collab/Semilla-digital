import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { register, checkEmailExists } from '../../../servers/AuthService'
import { getFerias } from '../../../servers/AgricultorServices'
import { useAuth } from '../../context/AuthContext'
import './RegisterForm.css'

interface Feria {
  id: number
  nombre: string
  ubicacion: string
}

const RegisterForm: React.FC = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: '',
    feriaId: '',
    puestoNumero: '',
    puestoDescripcion: '',
  })

  const [ferias, setFerias] = useState<Feria[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()

  useEffect(() => {
    const fetchFerias = async () => {
      try {
        const data = await getFerias()
        setFerias(data)
      } catch (err) {
        console.error('Error al cargar ferias:', err)
      }
    }
    fetchFerias()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validaciones
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    if (!formData.feriaId) {
      setError('Debes seleccionar una feria')
      return
    }

    setLoading(true)

    try {
      // Verificar si el email ya existe
      const emailExists = await checkEmailExists(formData.email)
      if (emailExists) {
        setError('Este email ya está registrado')
        setLoading(false)
        return
      }

      // Registrar usuario
      await register({
        email: formData.email,
        password: formData.password,
        nombre: formData.nombre,
        feriaId: parseInt(formData.feriaId),
        puestoNumero: formData.puestoNumero,
        puestoDescripcion: formData.puestoDescripcion,
      })

      // Auto-login tras registro exitoso
      const loginSuccess = await login(formData.email, formData.password)
      if (loginSuccess) {
        navigate('/')
      } else {
        // Si por alguna razón falla el login automático, redirigir al login
        navigate('/login', { state: { message: 'Registro exitoso. Inicia sesión para continuar.' } })
      }
    } catch {
      setError('Error al registrar usuario. Intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="register-form-container">
      <div className="register-form-card">
        <div className="register-form-header">
          <h2>Crear Cuenta</h2>
          <p>Registro de Feriante</p>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          {error && <div className="register-form-error">{error}</div>}

          <div className="register-form-group">
            <label htmlFor="nombre">Nombre Completo</label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Juan Pérez"
              required
            />
          </div>

          <div className="register-form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="tu@email.com"
              required
            />
          </div>

          <div className="register-form-row">
            <div className="register-form-group">
              <label htmlFor="password">Contraseña</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
              />
            </div>

            <div className="register-form-group">
              <label htmlFor="confirmPassword">Confirmar</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <div className="register-form-group">
            <label htmlFor="feriaId">Feria Asignada</label>
            <select
              id="feriaId"
              name="feriaId"
              value={formData.feriaId}
              onChange={handleChange}
              required
            >
              <option value="">Selecciona una feria</option>
              {ferias.map((feria) => (
                <option key={feria.id} value={feria.id}>
                  {feria.nombre} - {feria.ubicacion}
                </option>
              ))}
            </select>
          </div>

          <div className="register-form-group">
            <label htmlFor="puestoNumero">Número de Puesto</label>
            <input
              type="text"
              id="puestoNumero"
              name="puestoNumero"
              value={formData.puestoNumero}
              onChange={handleChange}
              placeholder="ej: A-12"
              required
            />
          </div>

          <div className="register-form-group">
            <label htmlFor="puestoDescripcion">Descripción del Puesto</label>
            <textarea
              id="puestoDescripcion"
              name="puestoDescripcion"
              value={formData.puestoDescripcion}
              onChange={handleChange}
              placeholder="ej: Puesto de verduras y frutas frescas"
              rows={3}
              required
            />
          </div>

          <button type="submit" className="register-form-button" disabled={loading}>
            {loading ? 'Registrando...' : 'Crear Cuenta'}
          </button>

          <div className="register-form-footer">
            <p>
              ¿Ya tienes cuenta? <Link to="/login">Inicia sesión aquí</Link>
            </p>
            <p>
              <Link to="/">← Volver al inicio</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

export default RegisterForm
