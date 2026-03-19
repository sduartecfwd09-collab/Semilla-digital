import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import Navbar from '../Navbar';
import Footer from '../Footer';
import { validateEmail } from '../../utils/validation';
import { ENDPOINTS } from '../../services/api.config';
import './Profile.css';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState({
    id: '',
    name: '',
    email: '',
    role: '',
    status: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [hasPendingRequest, setHasPendingRequest] = useState(false);
  const [originalData, setOriginalData] = useState({...userData});

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      navigate('/auth');
      return;
    }

    const cachedUser = JSON.parse(userStr);
    
    // Fetch fresh data from server
    fetch(`${ENDPOINTS.usuarios}/${cachedUser.id}`)
      .then(res => res.json())
      .then(data => {
        const userInfo = {
          id: data.id,
          name: data.name,
          email: data.email,
          role: data.role,
          status: data.status,
          password: data.password || '',
          confirmPassword: data.password || ''
        };
        setUserData(userInfo);
        setOriginalData({...userInfo});
        
        // Verificar si hay solicitudes pendientes (filtrado client-side por compatibilidad con json-server)
        return fetch(ENDPOINTS.solicitudesCambioRol);
      })
      .then(res => res?.json())
      .then(allRequests => {
        if (allRequests) {
          const userStr2 = localStorage.getItem('user');
          const currentId = userStr2 ? JSON.parse(userStr2).id : '';
          const pending = allRequests.filter(
            (r: any) => String(r.usuarioId) === String(currentId) && r.estado === 'Pendiente'
          );
          if (pending.length > 0) {
            setHasPendingRequest(true);
          }
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching user profile:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo cargar la información del perfil.',
          confirmButtonColor: 'var(--verde-claro)',
        });
        setLoading(false);
      });
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Si cancelamos, restauramos los datos originales
      setUserData(originalData);
    }
    setIsEditing(!isEditing);
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones al igual que en el registro
    const trimmedName = userData.name.trim();
    const trimmedEmail = userData.email.trim();
    const trimmedPassword = userData.password.trim();
    const trimmedConfirm = userData.confirmPassword.trim();

    if (!trimmedName || !trimmedEmail || !trimmedPassword || !trimmedConfirm) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Por favor, completá todos los datos del perfil.',
        confirmButtonColor: 'var(--verde-claro)',
      });
      return;
    }

    const emailValidation = validateEmail(trimmedEmail);
    if (!emailValidation.valid) {
      Swal.fire({
        icon: 'error',
        title: 'Correo inválido',
        text: emailValidation.message,
        confirmButtonColor: 'var(--verde-claro)',
      });
      return;
    }

    if (trimmedPassword.length <= 6) {
      Swal.fire({
        icon: 'warning',
        title: 'Contraseña insegura',
        text: 'La contraseña debe tener más de 6 dígitos de longitud.',
        confirmButtonColor: 'var(--verde-claro)',
      });
      return;
    }

    if (trimmedPassword !== trimmedConfirm) {
      Swal.fire({
        icon: 'error',
        title: 'Error de contraseña',
        text: 'Las contraseñas no coinciden.',
        confirmButtonColor: 'var(--verde-claro)',
      });
      return;
    }

    try {
      // Verificar si el correo ya está en uso por OTRO usuario
      const usersRes = await fetch('http://localhost:3001/usuarios');
      const allUsers = await usersRes.json();
      const emailExists = allUsers.some((u: any) => u.email === userData.email && u.id !== userData.id);

      if (emailExists) {
        Swal.fire({
          icon: 'error',
          title: 'Correo en uso',
          text: 'Este correo electrónico ya está registrado por otro usuario.',
          confirmButtonColor: 'var(--verde-claro)',
        });
        return;
      }

      const fullUserResponse = await fetch(`http://localhost:3001/usuarios/${userData.id}`);
      const fullUserData = await fullUserResponse.json();

      const updatedData = {
        ...fullUserData,
        name: userData.name,
        email: userData.email,
        password: userData.password,
      };

      const response = await fetch(`${ENDPOINTS.usuarios}/${userData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });

      if (response.ok) {
        const finalUser = await response.json();
        localStorage.setItem('user', JSON.stringify(finalUser));
        setOriginalData(userData);
        setIsEditing(false);
        
        Swal.fire({
          icon: 'success',
          title: 'Perfil actualizado',
          text: 'Tu información ha sido guardada correctamente.',
          confirmButtonColor: 'var(--verde-claro)',
          timer: 2000,
          showConfirmButton: false
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un problema al actualizar tu perfil.',
        confirmButtonColor: 'var(--verde-claro)',
      });
    }
  };

  const handleRoleRequest = async () => {
    try {
      const result = await Swal.fire({
        title: '¿Solicitar perfil de Agricultor?',
        text: 'Tu solicitud será enviada al administrador para su aprobación.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: 'var(--verde-claro)',
        cancelButtonColor: '#718096',
        confirmButtonText: 'Sí, enviar solicitud',
        cancelButtonText: 'Cancelar'
      });

      if (result.isConfirmed) {
        const newRequest = {
          usuarioId: userData.id,
          nombreUsuario: userData.name,
          correoUsuario: userData.email,
          rolSolicitado: 'Agricultor',
          estado: 'Pendiente',
          motivoRespuesta: '',
          fechaSolicitud: new Date().toISOString()
        };

        const response = await fetch('http://localhost:3001/solicitudesCambioRol', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newRequest)
        });

        if (response.ok) {
          setHasPendingRequest(true);
          
          Swal.fire({
            icon: 'success',
            title: 'Solicitud enviada',
            text: 'Tu petición de cambio de rol ha sido registrada y será revisada por un administrador.',
            confirmButtonColor: 'var(--verde-claro)',
          });
        }
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo procesar la solicitud en este momento.',
        confirmButtonColor: 'var(--verde-claro)',
      });
    }
  };


  // Iconos SVG para el ojo (mostrar/ocultar contraseña)
  const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    </svg>
  );

  const EyeOffIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
      <line x1="1" y1="1" x2="23" y2="23"></line>
    </svg>
  );

  if (loading) {
    return (
      <div className="profile-page-loading">
        <p>Cargando perfil...</p>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <Navbar />
      
      <main className="profile-container">
        <div className="profile-card animate-fade">
          <div className="profile-header">
            <div className="profile-avatar">
              {userData.name.charAt(0).toUpperCase()}
            </div>
            <h1>Mi Perfil</h1>
            <p className="profile-status">Estado: <span className={userData.status.toLowerCase() || 'activo'}>{userData.status || 'Activo'}</span></p>
          </div>

          <form onSubmit={handleSubmit} className="profile-form">
            <div className="profile-grid">
              <div className="input-group">
                <label>Nombre completo</label>
                <div className={`input-box ${!isEditing ? 'disabled' : ''}`}>
                  <span className="input-icon">👤</span>
                  <input 
                    type="text" 
                    name="name"
                    value={userData.name}
                    onChange={handleChange}
                    placeholder="Tu nombre"
                    readOnly={!isEditing}
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Correo electrónico</label>
                <div className={`input-box ${!isEditing ? 'disabled' : ''}`}>
                  <span className="input-icon">✉️</span>
                  <input 
                    type="email" 
                    name="email"
                    value={userData.email}
                    onChange={handleChange}
                    placeholder="tucorreo@ejemplo.com"
                    readOnly={!isEditing}
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Contraseña</label>
                <div className={`input-box ${!isEditing ? 'disabled' : ''}`}>
                  <span className="input-icon">🔒</span>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    name="password"
                    value={userData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    readOnly={!isEditing}
                    autoComplete="new-password"
                  />
                  <button 
                    type="button" 
                    className="password-toggle-profile"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>

              {isEditing && (
                <div className="input-group">
                  <label>Confirmar contraseña</label>
                  <div className="input-box">
                    <span className="input-icon">🔒</span>
                    <input 
                      type={showConfirmPassword ? "text" : "password"} 
                      name="confirmPassword"
                      value={userData.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      autoComplete="new-password"
                    />
                    <button 
                      type="button" 
                      className="password-toggle-profile"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                </div>
              )}

              <div className="input-group">
                <label>Rol asignado</label>
                <div className="input-box disabled">
                  <span className="input-icon">🛡️</span>
                  <input 
                    type="text" 
                    value={userData.role}
                    readOnly
                  />
                </div>
              </div>
            </div>

            <div className="profile-actions">
              {!isEditing ? (
                <>
                  <button type="button" className="edit-btn" onClick={handleEditToggle}>
                    Editar perfil
                  </button>
                  <button type="button" className="cancel-btn" onClick={() => navigate('/')}>
                    Volver al inicio
                  </button>
                </>
              ) : (
                <>
                  <button 
                    type="submit" 
                    className="save-btn" 
                    disabled={JSON.stringify(userData) === JSON.stringify(originalData)}
                    style={JSON.stringify(userData) === JSON.stringify(originalData) ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
                  >
                    Guardar cambios
                  </button>
                  <button type="button" className="cancel-btn" onClick={handleEditToggle}>
                    Cancelar
                  </button>
                </>
              )}
            </div>
          </form>

          {userData.role === 'Cliente' && (
            <div className="role-request-section">
              <div className="separator"></div>
              <div className="role-request-content">
                <h3>Solicitud para ser Agricultor</h3>
                <p>Completá el formulario con los datos de tu puesto para solicitar el cambio de rol a Agricultor. Un administrador revisará tu solicitud.</p>
                
                {hasPendingRequest ? (
                  <>
                    <div className="request-status-badge pending">
                      <span>⏳ Solicitud pendiente de aprobación</span>
                    </div>
                    <button 
                      type="button" 
                      className="role-request-btn"
                      onClick={() => navigate('/registro-agricultor')}
                    >
                      Editar solicitud
                    </button>
                  </>
                ) : (
                  <button 
                    type="button" 
                    className="role-request-btn"
                    onClick={() => navigate('/registro-agricultor')}
                  >
                    Solicitar ser Agricultor
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Profile;
