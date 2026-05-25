import React, { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import Swal from 'sweetalert2'
import { ENDPOINTS } from '../services/api.config'
import { validatePassword } from '../utils/validation'

/**
 * Página /reset-password?token=...
 * Recibe el token del email y permite al usuario establecer una nueva contraseña.
 */
const ResetPassword: React.FC = () => {
  const [params] = useSearchParams()
  const token = params.get('token') || ''
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  if (!token) {
    return (
      <div style={wrapper}>
        <div style={card}>
          <h1 style={{ color: '#991b1b', margin: 0 }}>Enlace inválido</h1>
          <p style={{ color: '#444' }}>
            Falta el token de recuperación. Solicitá un nuevo enlace desde la página de inicio de sesión.
          </p>
          <Link to="/recuperar-password" style={linkStyle}>Solicitar nuevo enlace</Link>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Las contraseñas no coinciden.' })
      return
    }
    const v = validatePassword(password)
    if (!v.valid) {
      Swal.fire({ icon: 'warning', title: 'Contraseña inválida', text: v.message })
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch(ENDPOINTS.authResetPassword, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      })
      const json = await res.json().catch(() => ({}))
      if (res.ok && json.success) {
        await Swal.fire({
          icon: 'success',
          title: 'Contraseña actualizada',
          text: 'Ya podés iniciar sesión con tu nueva contraseña.',
          confirmButtonColor: '#2d8a42',
        })
        navigate('/auth')
      } else {
        Swal.fire({
          icon: 'error',
          title: 'No se pudo actualizar',
          text: json.message || 'El enlace no es válido o expiró.',
        })
      }
    } catch {
      Swal.fire({ icon: 'error', title: 'Error de servidor', text: 'Intentá de nuevo más tarde.' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={wrapper}>
      <div style={card}>
        <h1 style={{ color: '#166534', margin: 0, marginBottom: '0.5rem' }}>Nueva contraseña</h1>
        <p style={{ color: '#444', marginTop: 0 }}>
          Elegí una contraseña nueva para tu cuenta.
        </p>
        <form onSubmit={handleSubmit} style={{ marginTop: '1.5rem' }}>
          <label style={labelStyle}>Nueva contraseña</label>
          <div style={passwordInputWrap}>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={passwordInputStyle}
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              title={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              style={toggleButtonStyle}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          <label style={{ ...labelStyle, marginTop: '1rem' }}>Confirmar contraseña</label>
          <div style={passwordInputWrap}>
            <input
              type={showConfirm ? 'text' : 'password'}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••"
              required
              style={passwordInputStyle}
            />
            <button
              type="button"
              onClick={() => setShowConfirm((current) => !current)}
              aria-label={showConfirm ? 'Ocultar confirmación' : 'Mostrar confirmación'}
              title={showConfirm ? 'Ocultar confirmación' : 'Mostrar confirmación'}
              style={toggleButtonStyle}
            >
              {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          <button
            type="submit"
            disabled={submitting}
            style={{
              width: '100%', marginTop: '1.25rem', padding: '0.85rem',
              background: '#2d8a42', color: '#fff', border: 'none', borderRadius: 8,
              fontSize: '1rem', fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer',
              opacity: submitting ? 0.6 : 1,
            }}
          >
            {submitting ? 'Guardando...' : 'Cambiar contraseña'}
          </button>
        </form>
      </div>
    </div>
  )
}

const wrapper: React.CSSProperties = {
  minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
  padding: '2rem', background: '#f0fdf4',
}
const card: React.CSSProperties = {
  maxWidth: 460, width: '100%', background: '#fff', padding: '2.5rem',
  borderRadius: 16, boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
}
const labelStyle: React.CSSProperties = { display: 'block', fontWeight: 600, marginBottom: 6, color: '#1f2937' }
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '0.75rem 1rem', borderRadius: 8,
  border: '1px solid #d1d5db', fontSize: '1rem', boxSizing: 'border-box',
}
const passwordInputWrap: React.CSSProperties = {
  display: 'flex', alignItems: 'center', width: '100%', borderRadius: 8,
  border: '1px solid #d1d5db', boxSizing: 'border-box', background: '#fff',
}
const passwordInputStyle: React.CSSProperties = {
  ...inputStyle, border: 'none', outline: 'none', flex: 1, minWidth: 0,
  paddingRight: '0.5rem',
}
const toggleButtonStyle: React.CSSProperties = {
  width: 44, height: 44, display: 'inline-flex', alignItems: 'center',
  justifyContent: 'center', border: 'none', background: 'transparent',
  color: '#374151', cursor: 'pointer', flex: '0 0 44px',
}
const linkStyle: React.CSSProperties = {
  display: 'inline-block', marginTop: '1rem', color: '#2d8a42',
  fontWeight: 600, textDecoration: 'none',
}

export default ResetPassword
