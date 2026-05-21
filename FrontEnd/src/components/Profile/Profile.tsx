import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import Navbar from '../Navbar';
import Footer from '../Footer';
import { validateEmail } from '../../utils/validation';
import { ENDPOINTS, authFetch } from '../../services/api.config';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './Profile.css';

// Iconos SVG para el ojo (mostrar/ocultar contraseña)




const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUserInContext } = useAuth();
  const { proformas } = useCart();
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState({
    id: '',
    name: '',
    nombre: '',
    email: '',
    role: '',
    status: '',
    password: '',
    confirmPassword: '',
    avatar: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agricultorRequest, setAgricultorRequest] = useState<any>(null);
  const [driverRequest, setDriverRequest] = useState<any>(null);
  const [originalData, setOriginalData] = useState({...userData});

  useEffect(() => {
    if (!user) {
      const stored = localStorage.getItem('user');
      if (!stored) {
        navigate('/auth');
        return;
      }
    }

    const currentId = user?.id || JSON.parse(localStorage.getItem('user') || '{}').id;
    if (!currentId) return;

    authFetch(`${ENDPOINTS.usuarios}/${currentId}`)
      .then(res => res.json())
      .then(data => {
        const userInfo = {
          id: data.id,
          name: data.name || data.nombre || '',
          nombre: data.nombre || data.name || '',
          email: data.email,
          role: data.role,
          status: data.status,
          password: data.password || '',
          confirmPassword: data.password || '',
          avatar: data.avatar || user?.avatar || ''
        };
        setUserData(userInfo);
        setOriginalData({...userInfo});
        
        return authFetch(ENDPOINTS.solicitudesCambioRol);
      })
      .then(res => res?.json())
      .then(allRequestsRaw => {
        const allRequests = allRequestsRaw?.data || allRequestsRaw;
        if (allRequests && Array.isArray(allRequests)) {
          const userRequests = allRequests.filter(
            (r: any) => String(r.usuario_id || r.usuarioId) === String(currentId)
          );
          
          const agRequests = userRequests.filter((r: any) => r.rol_solicitado === 'Agricultor' || r.rolSolicitado === 'Agricultor')
            .sort((a: any, b: any) => new Date(b.fecha_solicitud || b.fechaSolicitud).getTime() - new Date(a.fecha_solicitud || a.fechaSolicitud).getTime());
          if (agRequests.length > 0) {
            setAgricultorRequest(agRequests[0]);
          }

          const drRequests = userRequests.filter((r: any) => r.rol_solicitado === 'DRIVER' || r.rolSolicitado === 'DRIVER')
            .sort((a: any, b: any) => new Date(b.fecha_solicitud || b.fechaSolicitud).getTime() - new Date(a.fecha_solicitud || a.fechaSolicitud).getTime());
          if (drRequests.length > 0) {
            setDriverRequest(drRequests[0]);
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
      const usersRes = await authFetch(ENDPOINTS.usuarios);
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

      const fullUserResponse = await authFetch(`${ENDPOINTS.usuarios}/${userData.id}`);
      const fullUserData = await fullUserResponse.json();

      const updatedData = {
        ...fullUserData,
        name: trimmedName,
        email: trimmedEmail,
        password: trimmedPassword,
      };

      const response = await authFetch(`${ENDPOINTS.usuarios}/${userData.id}`, {
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
        await authFetch(`${ENDPOINTS.usuarios}/${userData.id}`, {
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



  const handleCancelarSolicitud = async () => {
    const reqId = agricultorRequest?.id;
    if (!reqId) return;

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
        await authFetch(`${ENDPOINTS.solicitudesCambioRol}/${reqId}`, {
          method: 'DELETE',
        });

        const puestosRes = await authFetch(ENDPOINTS.puestosAgricultor);
        const todosPuestos = await puestosRes.json();
        const misPuestos = todosPuestos.filter((p: any) => String(p.usuarioId) === String(userData.id));
        
        await Promise.all(misPuestos.map((p: any) => 
          authFetch(`${ENDPOINTS.puestosAgricultor}/${p.id}`, { method: 'DELETE' })
        ));
        
        setAgricultorRequest(null);
        
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

  const handleCancelarSolicitudDriver = async () => {
    const reqId = driverRequest?.id;
    if (!reqId) return;

    const { isConfirmed } = await Swal.fire({
      title: '¿Estás seguro?',
      text: "Se cancelará esta solicitud para ser Repartidor.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#718096',
      confirmButtonText: 'Sí, cancelar solicitud',
      cancelButtonText: 'Volver'
    });

    if (isConfirmed) {
      try {
        await authFetch(`${ENDPOINTS.solicitudesCambioRol}/${reqId}`, {
          method: 'DELETE',
        });
        setDriverRequest(null);
        Swal.fire({
          icon: 'success',
          title: 'Solicitud cancelada',
          text: 'Tu solicitud de repartidor ha sido cancelada correctamente.',
          confirmButtonColor: 'var(--verde-claro)',
        });
      } catch (error) {
        console.error('Error al cancelar solicitud de repartidor:', error);
        Swal.fire('Error', 'No se pudo cancelar la solicitud.', 'error');
      }
    }
  };

  const handleConvertirseEnAgricultor = async () => {
    try {
      setLoading(true);
      const [userRes, puestosRes, feriasRes] = await Promise.all([
        authFetch(`${ENDPOINTS.usuarios}/${userData.id}`),
        authFetch(ENDPOINTS.puestosAgricultor),
        authFetch(ENDPOINTS.ferias)
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

      await authFetch(`${ENDPOINTS.usuarios}/${userData.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'Agricultor' })
      });

      const updatedUserRes = await authFetch(`${ENDPOINTS.usuarios}/${userData.id}`);
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

  const handleConvertirseEnDriver = async () => {
    try {
      setLoading(true);
      await authFetch(`${ENDPOINTS.usuarios}/${userData.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'DRIVER' })
      });

      const updatedUserRes = await authFetch(`${ENDPOINTS.usuarios}/${userData.id}`);
      const updatedUserData = await updatedUserRes.json();
      localStorage.setItem('user', JSON.stringify(updatedUserData));

      Swal.fire({
        icon: 'success',
        title: '¡Felicidades!',
        text: 'Bienvenido a tu nuevo perfil de Repartidor en AgroMap.',
        confirmButtonColor: 'var(--verde-claro)',
      }).then(() => {
        window.location.href = '/driver';
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
                  (userData.name || userData.nombre || 'U').charAt(0).toUpperCase()
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

          {/* Historial de Compras */}
          <div className="profile-purchase-history">
            <div className="separator"></div>
            <h3>🛒 Mi Historial de Compras</h3>
            {proformas.length === 0 ? (
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '10px' }}>Aún no tienes compras o presupuestos generados.</p>
            ) : (
              <div className="purchase-list">
                {proformas.map((p) => (
                  <div className="purchase-item" key={p.id}>
                    <div className="purchase-header">
                      <span className="purchase-id">{p.id}</span>
                      <span className="purchase-date">{p.fecha}</span>
                    </div>
                    <div className="purchase-body">
                      <ul className="purchase-items-list">
                        {p.items.map((item, i) => (
                          <li key={i}>
                            {item.emoji} {item.nombre} (x{item.cantidad}) - ₡{(item.precio * item.cantidad).toLocaleString()}
                          </li>
                        ))}
                      </ul>
                      {p.delivery && (
                        <div className="purchase-delivery">
                          🚚 Envío a: {p.delivery.direccion} ({p.delivery.provincia}) - ₡{p.delivery.costoEnvio.toLocaleString()}
                        </div>
                      )}
                    </div>
                    <div className="purchase-footer">
                      <strong>Total:</strong> <span>₡{p.total.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Solicitud para ser Agricultor - Solo se muestra si NO es Agricultor ni Admin */}
          {(!userData.role || (userData.role.toLowerCase() !== 'agricultor' && userData.role.toLowerCase() !== 'administrador')) && (
            <div className="role-request-section">
              <div className="separator"></div>
              <div className="role-request-content">
                <h3>Solicitud para ser Agricultor</h3>
                
                {agricultorRequest && (agricultorRequest.estado === 'Pendiente' || agricultorRequest.estado === 'Pendiente') && (
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

                {agricultorRequest && (agricultorRequest.estado === 'Aprobada' || agricultorRequest.estado === 'Aprobada') && (
                  <>
                    <p><strong>¡Felicidades!</strong> Tu solicitud ha sido aprobada por el administrador.</p>
                    {agricultorRequest.motivo_respuesta && <p style={{fontStyle: 'italic'}}>Mensaje del admin: "{agricultorRequest.motivo_respuesta}"</p>}
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

                {agricultorRequest && (agricultorRequest.estado === 'Rechazada' || agricultorRequest.estado === 'Rechazada') && (
                  <>
                    <p>Tu solicitud ha sido rechazada.</p>
                    {agricultorRequest.motivo_respuesta && <p style={{color: '#991b1b'}}><strong>Motivo:</strong> "{agricultorRequest.motivo_respuesta}"</p>}
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

                {!agricultorRequest && (
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

          {/* Solicitud para ser Repartidor - Solo se muestra si NO es Driver ni Admin */}
          {(!userData.role || (userData.role.toLowerCase() !== 'driver' && userData.role.toLowerCase() !== 'administrador')) && (
            <div className="role-request-section">
              <div className="separator"></div>
              <div className="role-request-content">
                <h3>Solicitud para ser Repartidor (Delivery)</h3>
                
                {driverRequest && (driverRequest.estado === 'Pendiente' || driverRequest.estado === 'Pendiente') && (
                  <>
                    <p>Tu solicitud está siendo revisada por un administrador. Podés actualizar la información de tu vehículo si lo necesitás.</p>
                    <div className="request-status-badge pending">
                      <span>⏳ Solicitud pendiente de aprobación</span>
                    </div>
                    <div style={{ display: 'flex', gap: '15px' }}>
                      <button 
                        type="button" 
                        className="role-request-btn"
                        onClick={() => navigate('/registro-delivery')}
                        style={{ flex: 1 }}
                      >
                        Editar solicitud
                      </button>
                      <button 
                        type="button" 
                        className="role-request-btn"
                        style={{ flex: 1, backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}
                        onClick={handleCancelarSolicitudDriver}
                      >
                        Cancelar solicitud
                      </button>
                    </div>
                  </>
                )}

                {driverRequest && (driverRequest.estado === 'Aprobada' || driverRequest.estado === 'Aprobada') && (
                  <>
                    <p><strong>¡Felicidades!</strong> Tu solicitud ha sido aprobada por el administrador.</p>
                    {driverRequest.motivo_respuesta && <p style={{fontStyle: 'italic'}}>Mensaje del admin: "{driverRequest.motivo_respuesta}"</p>}
                    <div className="request-status-badge approved" style={{backgroundColor: '#f0fdf4', color: '#166534', borderColor: '#bbf7d0', marginBottom: '20px', padding: '10px', borderRadius: '8px'}}>
                      <span>✅ Aprobada</span>
                    </div>
                    <button 
                      type="button" 
                      className="save-btn"
                      onClick={handleConvertirseEnDriver}
                      style={{width: '100%', maxWidth: '300px', margin: '0 auto', display: 'block'}}
                    >
                      Convertirse en repartidor
                    </button>
                  </>
                )}

                {driverRequest && (driverRequest.estado === 'Rechazada' || driverRequest.estado === 'Rechazada') && (
                  <>
                    <p>Tu solicitud ha sido rechazada.</p>
                    {driverRequest.motivo_respuesta && <p style={{color: '#991b1b'}}><strong>Motivo:</strong> "{driverRequest.motivo_respuesta}"</p>}
                    <div className="request-status-badge rejected" style={{backgroundColor: '#fef2f2', color: '#991b1b', borderColor: '#fecaca', marginBottom: '20px', padding: '10px', borderRadius: '8px'}}>
                      <span>❌ Rechazada</span>
                    </div>
                    <button 
                      type="button" 
                      className="role-request-btn"
                      onClick={() => navigate('/registro-delivery?reset=true')}
                    >
                      Enviar nueva solicitud
                    </button>
                  </>
                )}

                {!driverRequest && (
                  <>
                    <p>Completá el formulario con los datos de tu vehículo para solicitar el cambio de rol a Repartidor. Un administrador revisará tu solicitud.</p>
                    <button 
                      type="button" 
                      className="role-request-btn"
                      onClick={() => navigate('/registro-delivery')}
                    >
                      Solicitar ser Repartidor
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
