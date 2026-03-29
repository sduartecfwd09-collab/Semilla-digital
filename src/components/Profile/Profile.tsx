import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import Navbar from '../Navbar';
import Footer from '../Footer';
import { validateEmail } from '../../utils/validation';
import { ENDPOINTS } from '../../services/api.config';
import { useAuth } from '../context/AuthContext';
import './Profile.css';

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



const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUserInContext } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState({
    id: '',
    name: '',
    email: '',
    role: '',
    status: '',
    password: '',
    confirmPassword: '',
    avatar: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [hasPendingRequest, setHasPendingRequest] = useState(false);
  const [requestStatus, setRequestStatus] = useState<string | null>(null);
  const [requestMotivo, setRequestMotivo] = useState<string>('');
  const [requestId, setRequestId] = useState<string>('');
  const [originalData, setOriginalData] = useState({...userData});

  useEffect(() => {
    // Si no hay usuario y ya terminó de cargar el context, vamos a auth
    if (!user) {
      const stored = localStorage.getItem('user');
      if (!stored) {
        navigate('/auth');
        return;
      }
    }

    const currentId = user?.id || JSON.parse(localStorage.getItem('user') || '{}').id;
    if (!currentId) return;

    // Fetch fresh data from server
    fetch(`${ENDPOINTS.usuarios}/${currentId}`)
      .then(res => res.json())
      .then(data => {
        const userInfo = {
          id: data.id,
          name: data.name,
          email: data.email,
          role: data.role,
          status: data.status,
          password: data.password || '',
          confirmPassword: data.password || '',
          avatar: data.avatar || user?.avatar || ''
        };
        setUserData(userInfo);
        setOriginalData({...userInfo});
        
        return fetch(ENDPOINTS.solicitudesCambioRol);
      })
      .then(res => res?.json())
      .then(allRequests => {
        if (allRequests) {
          const userRequests = allRequests.filter(
            (r: any) => String(r.usuarioId) === String(currentId)
          ).sort((a: any, b: any) => new Date(b.fechaSolicitud).getTime() - new Date(a.fechaSolicitud).getTime());
          
          if (userRequests.length > 0) {
            // Priorizamos: Aprobada > Pendiente > Rechazada
            let activeRequest = userRequests[0];
            const aprobada = userRequests.find((r: any) => r.estado === 'Aprobada');
            const pendiente = userRequests.find((r: any) => r.estado === 'Pendiente');
            const rechazada = userRequests.find((r: any) => r.estado === 'Rechazada');
            
            if (aprobada) {
              activeRequest = aprobada;
            } else if (pendiente) {
              activeRequest = pendiente;
            } else if (rechazada) {
              activeRequest = rechazada;
            }

            setRequestStatus(activeRequest.estado);
            setRequestMotivo(activeRequest.motivoRespuesta || '');
            setRequestId(activeRequest.id || '');
            if (activeRequest.estado === 'Pendiente') {
              setHasPendingRequest(true);
            }
          }
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching user profile:', err);
        setLoading(false);
      });
  }, [user, navigate]);

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
      const usersRes = await fetch(ENDPOINTS.usuarios);
      const allUsers = await usersRes.json();
      const emailExists = allUsers.some((u: { email: string; id: string }) => u.email === userData.email && u.id !== userData.id);

      if (emailExists) {
        Swal.fire({
          icon: 'error',
          title: 'Correo en uso',
          text: 'Este correo electrónico ya está registrado por otro usuario.',
          confirmButtonColor: 'var(--verde-claro)',
        });
        return;
      }

      const fullUserResponse = await fetch(`${ENDPOINTS.usuarios}/${userData.id}`);
      const fullUserData = await fullUserResponse.json();

      const updatedData = {
        ...fullUserData,
        name: trimmedName,
        email: trimmedEmail,
        password: trimmedPassword,
      };

      const response = await fetch(`${ENDPOINTS.usuarios}/${userData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });

      if (response.ok) {
        const finalUser = await response.json();
        updateUserInContext(finalUser);
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
    } catch {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un problema al actualizar tu perfil.',
        confirmButtonColor: 'var(--verde-claro)',
      });
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      Swal.fire('Error', 'Por favor selecciona una imagen válida.', 'error');
      return;
    }

    // Validar tamaño (máximo 2MB para db.json)
    if (file.size > 2 * 1024 * 1024) {
      Swal.fire('Error', 'La imagen es demasiado grande. Máximo 2MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Image = event.target?.result as string;
      
      try {
        // Actualizamos localmente y en contexto global
        setUserData(prev => ({ ...prev, avatar: base64Image }));
        updateUserInContext({ avatar: base64Image });
        
        // Guardamos en el servidor
        await fetch(`${ENDPOINTS.usuarios}/${userData.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ avatar: base64Image })
        });

        Swal.fire({
          icon: 'success',
          title: 'Foto actualizada',
          text: 'Tu foto de perfil se ha guardado correctamente.',
          timer: 1500,
          showConfirmButton: false
        });
      } catch (error) {
        console.error('Error updating avatar:', error);
        Swal.fire('Error', 'No se pudo guardar la foto de perfil.', 'error');
      }
    };
    reader.readAsDataURL(file);
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

        const response = await fetch(ENDPOINTS.solicitudesCambioRol, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newRequest)
        });

        if (response.ok) {
          setHasPendingRequest(true);
          setRequestStatus('Pendiente');
          
          Swal.fire({
            icon: 'success',
            title: 'Solicitud enviada',
            text: 'Tu petición de cambio de rol ha sido registrada y será revisada por un administrador.',
            confirmButtonColor: 'var(--verde-claro)',
          });
        } else {
          throw new Error('Error al enviar la solicitud');
        }
      }
    } catch {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo procesar la solicitud en este momento.',
        confirmButtonColor: 'var(--verde-claro)',
      });
    }
  };

  const handleCancelarSolicitud = async () => {
    if (!requestId) return;

    const { isConfirmed } = await Swal.fire({
      title: '¿Estás seguro?',
      text: "Se cancelará esta solicitud para ser Agricultor y tendrás que volver a enviarla si cambiás de opinión.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#718096',
      confirmButtonText: 'Sí, cancelar solicitud',
      cancelButtonText: 'Volver'
    });

    if (isConfirmed) {
      try {
        // Borrar la solicitud de cambio de rol
        await fetch(`${ENDPOINTS.solicitudesCambioRol}/${requestId}`, {
          method: 'DELETE',
        });

        // Borrar la información del puesto asociado (puestosAgricultor)
        const puestosRes = await fetch(ENDPOINTS.puestosAgricultor);
        const todosPuestos = await puestosRes.json();
        const misPuestos = todosPuestos.filter((p: any) => String(p.usuarioId) === String(userData.id));
        
        // Elimar todos sus puestos (normalmente debería ser solo uno)
        await Promise.all(misPuestos.map((p: any) => 
          fetch(`${ENDPOINTS.puestosAgricultor}/${p.id}`, { method: 'DELETE' })
        ));
        
        setRequestStatus(null);
        setHasPendingRequest(false);
        setRequestId('');
        
        Swal.fire({
          icon: 'success',
          title: 'Solicitud cancelada',
          text: 'Tu solicitud y toda la información asociada han sido borradas correctamente.',
          confirmButtonColor: 'var(--verde-claro)',
        });
      } catch (error) {
        console.error('Error al cancelar solicitud:', error);
        Swal.fire('Error', 'No se pudo cancelar la solicitud por completo.', 'error');
      }
    }
  };

  const handleConvertirseEnAgricultor = async () => {
    try {
      setLoading(true);
      
      // Obtener datos del puesto solicitado y la feria asignada
      const [userRes, puestosRes, feriasRes] = await Promise.all([
        fetch(`${ENDPOINTS.usuarios}/${userData.id}`),
        fetch(ENDPOINTS.puestosAgricultor),
        fetch(ENDPOINTS.ferias)
      ]);
      
      const currentFullUser = await userRes.json();
      const allPuestos = await puestosRes.json();
      const allFerias = await feriasRes.json();
      
      const miPuesto = allPuestos.filter((p: any) => String(p.usuarioId) === String(userData.id)).pop();
      const feriasSolicitadas = miPuesto?.ubicacion || [];
      const feriaAsignada = allFerias.find((f: any) => String(f.id) === String(currentFullUser.feriaId));
      
      let mensajeFeria = '';
      if (feriaAsignada) {
        const feriaName = feriaAsignada.name || feriaAsignada.nombre || '';
        const fueSolicitada = Array.isArray(feriasSolicitadas) 
          ? feriasSolicitadas.includes(feriaName)
          : feriasSolicitadas === feriaName;
          
        if (feriaName) {
          if (fueSolicitada) {
            mensajeFeria = `\n\nTu solicitud para vender en la feria de ${feriaName} ha sido aceptada.`;
          } else {
            mensajeFeria = `\n\nSe te ha asignado la feria de ${feriaName} para tus ventas.`;
          }
        }
      }

      await fetch(`${ENDPOINTS.usuarios}/${userData.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'Agricultor' })
      });

      const updatedUserRes = await fetch(`${ENDPOINTS.usuarios}/${userData.id}`);
      const updatedUserData = await updatedUserRes.json();
      localStorage.setItem('user', JSON.stringify(updatedUserData));

      Swal.fire({
        icon: 'success',
        title: '¡Felicidades!',
        text: `Bienvenido a tu nuevo perfil de Agricultor en AgroMap.${mensajeFeria}`,
        confirmButtonColor: 'var(--verde-claro)',
      }).then(() => {
        window.location.href = '/agricultor';
      });
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'No se pudo actualizar tu perfil.', 'error');
      setLoading(false);
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
            <div className="profile-avatar-container">
              <div className="profile-avatar">
                {userData.avatar ? (
                  <img src={userData.avatar} alt="Avatar" className="avatar-img" />
                ) : (
                  userData.name.charAt(0).toUpperCase()
                )}
              </div>
              <label htmlFor="avatar-upload" className="avatar-upload-label" title="Cambiar foto">
                <span className="camera-icon">📷</span>
                <input 
                  type="file" 
                  id="avatar-upload" 
                  accept="image/*" 
                  onChange={handleAvatarChange} 
                  style={{ display: 'none' }} 
                />
              </label>
            </div>
            <label htmlFor="avatar-upload" className="change-photo-text">
               Cambiar foto
            </label>
            <h1>Mi Perfil</h1>
            <p className="profile-status">Estado: <span className={userData.status?.toLowerCase() || 'activo'}>{userData.status || 'Activo'}</span></p>
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

          {(userData.role?.toLowerCase() === 'usuario' || !userData.role) && (
            <div className="role-request-section">
              <div className="separator"></div>
              <div className="role-request-content">
                <h3>Solicitud para ser Agricultor</h3>
                
                {requestStatus === 'Pendiente' && (
                  <>
                    <p>Tu solicitud está siendo revisada por un administrador. Podés actualizar la información de tu puesto si lo necesitás.</p>
                    <div className="request-status-badge pending">
                      <span>⏳ Solicitud pendiente de aprobación</span>
                    </div>
                    <div style={{ display: 'flex', gap: '15px' }}>
                      <button 
                        type="button" 
                        className="role-request-btn"
                        onClick={() => navigate('/registro-agricultor')}
                        style={{ flex: 1 }}
                      >
                        Editar solicitud
                      </button>
                      <button 
                        type="button" 
                        className="role-request-btn"
                        style={{ flex: 1, backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}
                        onClick={handleCancelarSolicitud}
                      >
                        Cancelar solicitud
                      </button>
                    </div>
                  </>
                )}

                {requestStatus === 'Aprobada' && (
                  <>
                    <p><strong>¡Felicidades!</strong> Tu solicitud ha sido aprobada por el administrador.</p>
                    {requestMotivo && <p style={{fontStyle: 'italic'}}>Mensaje del admin: "{requestMotivo}"</p>}
                    <div className="request-status-badge approved" style={{backgroundColor: '#f0fdf4', color: '#166534', borderColor: '#bbf7d0', marginBottom: '20px', padding: '10px', borderRadius: '8px'}}>
                      <span>✅ Aprobada</span>
                    </div>
                    <button 
                      type="button" 
                      className="save-btn"
                      onClick={handleConvertirseEnAgricultor}
                      style={{width: '100%', maxWidth: '300px', margin: '0 auto', display: 'block'}}
                    >
                      Convertirse en agricultor
                    </button>
                  </>
                )}

                {requestStatus === 'Rechazada' && (
                  <>
                    <p>Tu solicitud ha sido rechazada.</p>
                    {requestMotivo && <p style={{color: '#991b1b'}}><strong>Motivo:</strong> "{requestMotivo}"</p>}
                    <div className="request-status-badge rejected" style={{backgroundColor: '#fef2f2', color: '#991b1b', borderColor: '#fecaca', marginBottom: '20px', padding: '10px', borderRadius: '8px'}}>
                      <span>❌ Rechazada</span>
                    </div>
                    <button 
                      type="button" 
                      className="role-request-btn"
                      onClick={() => navigate('/registro-agricultor?reset=true')}
                    >
                      Enviar nueva solicitud
                    </button>
                  </>
                )}

                {!requestStatus && (
                  <>
                    <p>Completá el formulario con los datos de tu puesto para solicitar el cambio de rol a Agricultor. Un administrador revisará tu solicitud.</p>
                    <button 
                      type="button" 
                      className="role-request-btn"
                      onClick={() => navigate('/registro-agricultor')}
                    >
                      Solicitar ser Agricultor
                    </button>
                  </>
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
