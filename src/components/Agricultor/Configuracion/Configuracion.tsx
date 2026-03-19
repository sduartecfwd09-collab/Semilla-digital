import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import AdminSidebar from '../../adminAgricultor/AgricultorSidebar'
import AdminHeader from '../../adminAgricultor/AgricultorHeader'
import { updateUser } from '../../../servers/AuthService'
import './Configuracion.css'

const Configuracion: React.FC = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [editingProfile, setEditingProfile] = useState(false)
  const [profileData, setProfileData] = useState({
    nombre: user?.nombre || '',
    email: user?.email || '',
  })

  const handleSaveProfile = async () => {
    if (!user) return

    try {
      await updateUser(user.id, {
        nombre: profileData.nombre,
        email: profileData.email,
      })

      // Actualizar localStorage
      const storedUser = JSON.parse(localStorage.getItem('auth_user') || '{}')
      storedUser.nombre = profileData.nombre
      storedUser.email = profileData.email
      localStorage.setItem('auth_user', JSON.stringify(storedUser))

      setEditingProfile(false)
      alert('Perfil actualizado correctamente')
      window.location.reload() // Recargar para actualizar el contexto
    } catch (error) {
      console.error('Error al actualizar perfil:', error)
      alert('Error al actualizar el perfil')
    }
  }

  const handleLogout = () => {
    if (window.confirm('¿Estás seguro de cerrar sesión?')) {
      logout()
      navigate('/login')
    }
  }

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-main">
        <AdminHeader title="Configuración" subtitle="Administra tu cuenta y preferencias" />
        <div className="admin-content">
          {/* Información de Perfil */}
          <div className="config-card">
            <div className="config-card-header">
              <h3>👤 Información de Perfil</h3>
              {!editingProfile && (
                <button onClick={() => setEditingProfile(true)} className="config-edit-btn">
                  ✏️ Editar
                </button>
              )}
            </div>
            <div className="config-card-body">
              {editingProfile ? (
                <div className="config-edit-form">
                  <div className="config-form-group">
                    <label>Nombre Completo</label>
                    <input
                      type="text"
                      value={profileData.nombre}
                      onChange={(e) =>
                        setProfileData({ ...profileData, nombre: e.target.value })
                      }
                      placeholder="Tu nombre completo"
                    />
                  </div>
                  <div className="config-form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) =>
                        setProfileData({ ...profileData, email: e.target.value })
                      }
                      placeholder="tu@email.com"
                    />
                  </div>
                  <div className="config-form-actions">
                    <button
                      onClick={() => setEditingProfile(false)}
                      className="config-btn-cancel"
                    >
                      Cancelar
                    </button>
                    <button onClick={handleSaveProfile} className="config-btn-save">
                      Guardar Cambios
                    </button>
                  </div>
                </div>
              ) : (
                <div className="config-info-grid">
                  <div className="config-info-item">
                    <span className="config-info-label">Nombre:</span>
                    <span className="config-info-value">{user?.nombre}</span>
                  </div>
                  <div className="config-info-item">
                    <span className="config-info-label">Email:</span>
                    <span className="config-info-value">{user?.email}</span>
                  </div>
                  <div className="config-info-item">
                    <span className="config-info-label">Rol:</span>
                    <span className="config-info-value">Feriante Administrador</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Información de Cuenta */}
          <div className="config-card">
            <div className="config-card-header">
              <h3>🔐 Seguridad</h3>
            </div>
            <div className="config-card-body">

              {/*aquí deberá ir el botón en el que el Agricultor pueda cambiar su contraseña */}
              
              <p className="config-note">
                Las contraseñas se manejan de forma segura. Si necesitas cambiar tu contraseña,
                contacta al administrador del sistema.
              </p>
            </div>
          </div>

          {/* Acciones de Cuenta */}
          <div className="config-card">
            <div className="config-card-header">
              <h3>⚙️ Acciones de Cuenta</h3>
            </div>
            <div className="config-card-body">
              <div className="config-actions">
                <button onClick={handleLogout} className="config-logout-btn">
                  🚪 Cerrar Sesión
                </button>
              </div>
            </div>
          </div>

          {/* Información del Sistema */}
          <div className="config-footer">
            <p>AgroMap Admin Panel v1.0.0</p>
            <p>Sistema de gestión para feriantes</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Configuracion
