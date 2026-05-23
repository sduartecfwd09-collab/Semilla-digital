import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import Swal from 'sweetalert2'
import { ENDPOINTS } from '../services/api.config'
import { validateEmail } from '../utils/validation'

/**
 * Página /recuperar-password
 * Solicita el correo del usuario y dispara el envío del email con el link
 * de recuperación. El backend responde 200 siempre (sin revelar si el email
 * existe), así que la UI muestra el mismo mensaje en cualquier caso.
 */
const RecuperarPassword: React.FC = () => {
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = email.trim()
    const v = validateEmail(trimmed)
    if (!v.valid) {
      Swal.fire({ icon: 'warning', title: 'Correo inválido', text: v.message })
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch(ENDPOINTS.authForgotPassword, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed }),
      })
      if (!res.ok) throw new Error('http')
      setSent(true)
    } catch {
      Swal.fire({
        icon: 'error',
        title: 'Error de servidor',
        text: 'No se pudo procesar la solicitud. Intentá de nuevo más tarde.',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '2rem', background: '#f0fdf4',
    }}>
      <div style={{
        maxWidth: 460, width: '100%', background: '#fff', padding: '2.5rem',
        borderRadius: 16, boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
      }}>
        <h1 style={{ color: '#166534', margin: 0, marginBottom: '0.5rem' }}>Recuperar contraseña</h1>

        {sent ? (
          <>
            <p style={{ color: '#444', lineHeight: 1.55 }}>
              Si el correo está registrado, te enviamos un enlace para restablecer tu
              contraseña. Revisá tu bandeja de entrada (y la carpeta de spam).
              El enlace expira en 30 minutos.
            </p>
            <Link
              to="/auth"
              style={{
                display: 'inline-block', marginTop: '1.25rem', color: '#2d8a42',
                fontWeight: 600, textDecoration: 'none',
              }}
            >
              ← Volver al inicio de sesión
            </Link>
          </>
        ) : (
          <>
            <p style={{ color: '#444', lineHeight: 1.55, marginTop: 0 }}>
              Ingresá el correo asociado a tu cuenta y te enviaremos un enlace para
              crear una nueva contraseña.
            </p>
            <form onSubmit={handleSubmit} style={{ marginTop: '1.5rem' }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, color: '#1f2937' }}>
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tucorreo@ejemplo.com"
                required
                style={{
                  width: '100%', padding: '0.75rem 1rem', borderRadius: 8,
                  border: '1px solid #d1d5db', fontSize: '1rem', boxSizing: 'border-box',
                }}
              />
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
                {submitting ? 'Enviando...' : 'Enviar enlace de recuperación'}
              </button>
            </form>
            <Link
              to="/auth"
              style={{
                display: 'inline-block', marginTop: '1rem', color: '#2d8a42',
                fontWeight: 600, textDecoration: 'none', fontSize: '0.9rem',
              }}
            >
              ← Volver al inicio de sesión
            </Link>
          </>
        )}
      </div>
    </div>
  )
}

export default RecuperarPassword
