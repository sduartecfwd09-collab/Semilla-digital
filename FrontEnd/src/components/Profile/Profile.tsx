import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import Navbar from '../Navbar';
import Footer from '../Footer';
import { validateEmail, validatePassword } from '../../utils/validation';
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
    avatar: ''
  });
<<<<<<< HEAD
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agricultorRequest, setAgricultorRequest] = useState<any>(null);
  const [driverRequest, setDriverRequest] = useState<any>(null);
  const [originalData, setOriginalData] = useState({...userData});

  useEffect(() => {
=======
  const [hasPendingRequest, setHasPendingRequest] = useState(false);
  const [requestStatus, setRequestStatus] = useState<string | null>(null);
  const [requestMotivo, setRequestMotivo] = useState<string>('');
  const [requestId, setRequestId] = useState<string>('');
  const [originalData, setOriginalData] = useState({...userData});

  useEffect(() => {
    let cancelled = false;

    // Si no hay usuario y ya terminó de cargar el context, vamos a auth
>>>>>>> 23cae5ce1cac93a309b789a8f54cd0593a6c25f6
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
      .then(json => {
        if (cancelled) return undefined;
        const data = json.success ? json.data : json;

        const userInfo = {
          id: data.id,
          name: data.name || data.nombre || '',
          nombre: data.nombre || data.name || '',
          email: data.email,
          role: data.role || data.rol?.nombre || '',
          status: data.status,
          avatar: data.avatar || user?.avatar || ''
        };
        setUserData(userInfo);
        setOriginalData({...userInfo});

        return authFetch(ENDPOINTS.solicitudesCambioRol);
      })
      .then(res => res?.json())
<<<<<<< HEAD
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
=======
      .then(json => {
        if (cancelled) return;
        if (json) {
          const allRequests = json.success ? json.data : json;
          const userRequests = (allRequests || []).filter(
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
>>>>>>> 23cae5ce1cac93a309b789a8f54cd0593a6c25f6

          const drRequests = userRequests.filter((r: any) => r.rol_solicitado === 'DRIVER' || r.rolSolicitado === 'DRIVER')
            .sort((a: any, b: any) => new Date(b.fecha_solicitud || b.fechaSolicitud).getTime() - new Date(a.fecha_solicitud || a.fechaSolicitud).getTime());
          if (drRequests.length > 0) {
            setDriverRequest(drRequests[0]);
          }
        }
        setLoading(false);
      })
      .catch(err => {
        if (cancelled) return;
        console.error('Error fetching user profile:', err);
        setLoading(false);
      });

    return () => { cancelled = true; };
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


  const handleChangePassword = async () => {
    const { value: formValues } = await Swal.fire({
      title: 'Cambiar contraseña',
      html:
        '<input id="swal-current" type="password" class="swal2-input" placeholder="Contraseña actual" autocomplete="current-password">' +
        '<input id="swal-new" type="password" class="swal2-input" placeholder="Nueva contraseña" autocomplete="new-password">' +
        '<input id="swal-confirm" type="password" class="swal2-input" placeholder="Confirmar nueva contraseña" autocomplete="new-password">',
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Cambiar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: 'var(--verde-claro)',
      cancelButtonColor: '#718096',
      preConfirm: () => {
        const current = (document.getElementById('swal-current') as HTMLInputElement)?.value || '';
        const next = (document.getElementById('swal-new') as HTMLInputElement)?.value || '';
        const confirm = (document.getElementById('swal-confirm') as HTMLInputElement)?.value || '';

        if (!current || !next || !confirm) {
          Swal.showValidationMessage('Por favor completá los tres campos.');
          return false;
        }
        const pwdCheck = validatePassword(next);
        if (!pwdCheck.valid) {
          Swal.showValidationMessage(pwdCheck.message || 'Contraseña inválida');
          return false;
        }
        if (next !== confirm) {
          Swal.showValidationMessage('La nueva contraseña y su confirmación no coinciden.');
          return false;
        }
        if (next === current) {
          Swal.showValidationMessage('La nueva contraseña debe ser distinta de la actual.');
          return false;
        }
        return { current, next };
      }
    });

    if (!formValues) return;

    try {
      const response = await authFetch(ENDPOINTS.cambiarPassword(userData.id), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: formValues.current,
          newPassword: formValues.next
        })
      });

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Contraseña actualizada',
          text: 'Tu contraseña se cambió correctamente.',
          confirmButtonColor: 'var(--verde-claro)',
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        const errorData = await response.json().catch(() => ({}));
        const message = response.status === 401
          ? 'La contraseña actual no es correcta.'
          : errorData.message || errorData.error || 'No se pudo cambiar la contraseña.';
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: message,
          confirmButtonColor: 'var(--verde-claro)',
        });
      }
    } catch (err) {
      console.error('Error al cambiar contraseña:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error de servidor',
        text: 'Hubo un problema al conectar con el servidor.',
        confirmButtonColor: 'var(--verde-claro)',
      });
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = userData.name.trim();
    const trimmedEmail = userData.email.trim();

    if (!trimmedName || !trimmedEmail) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Por favor, completá tu nombre y correo.',
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

    try {
      const fullUserResponse = await authFetch(`${ENDPOINTS.usuarios}/${userData.id}`);
      const fullUserJson = await fullUserResponse.json();
      const fullUserData = fullUserJson.success ? fullUserJson.data : fullUserJson;

      // Eliminamos password del payload: el cambio de contraseña usa su propio endpoint
      const { password: _omitPassword, ...safeUserData } = fullUserData || {};
      const updatedData: any = {
        ...safeUserData,
        name: trimmedName,
        email: trimmedEmail,
      };

      const response = await authFetch(`${ENDPOINTS.usuarios}/${userData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });

      if (response.ok) {
        const finalJson = await response.json();
        const finalUser = finalJson.success ? finalJson.data : finalJson;
        updateUserInContext(finalUser);

        const newOriginalData = { ...userData };
        setOriginalData(newOriginalData);
        setUserData(newOriginalData);
        setIsEditing(false);
        
        Swal.fire({
          icon: 'success',
          title: 'Perfil actualizado',
          text: 'Tu información ha sido guardada correctamente.',
          confirmButtonColor: 'var(--verde-claro)',
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.message || errorData.error || 'Hubo un problema al actualizar tu perfil.';
        if (errorMessage.toLowerCase().includes('unique') || errorMessage.toLowerCase().includes('existe')) {
          Swal.fire({
            icon: 'error',
            title: 'Correo en uso',
            text: 'Este correo electrónico ya está registrado por otro usuario.',
            confirmButtonColor: 'var(--verde-claro)',
          });
        } else {
          throw new Error(errorMessage);
        }
      }
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message || 'Hubo un problema al actualizar tu perfil.',
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

<<<<<<< HEAD

=======
  const handleRoleRequest = async () => {
    try {
      const result = await Swal.fire({
        title: '¿Solicitar perfil de Productor?',
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
          rolSolicitado: 'Productor',
          estado: 'Pendiente',
          motivoRespuesta: '',
          fechaSolicitud: new Date().toISOString()
        };

        const response = await authFetch(ENDPOINTS.solicitudesCambioRol, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newRequest)
        });

        if (response.ok) {
          const resJson = await response.json();
          const createdSolicitud = resJson.success ? resJson.data : resJson;
          setHasPendingRequest(true);
          setRequestStatus('Pendiente');
          setRequestId(createdSolicitud.id || '');
          
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
>>>>>>> 23cae5ce1cac93a309b789a8f54cd0593a6c25f6

  const handleCancelarSolicitud = async () => {
    const reqId = agricultorRequest?.id;
    if (!reqId) return;

    const { isConfirmed } = await Swal.fire({
      title: '¿Estás seguro?',
      text: "Se cancelará esta solicitud para ser Productor y tendrás que volver a enviarla si cambiás de opinión.",
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

<<<<<<< HEAD
        const puestosRes = await authFetch(ENDPOINTS.puestosAgricultor);
        const todosPuestos = await puestosRes.json();
        const misPuestos = todosPuestos.filter((p: any) => String(p.usuarioId) === String(userData.id));
=======
        // Borrar la información del puesto asociado (puestosProductor)
        const puestosRes = await authFetch(ENDPOINTS.puestosProductor);
        const puestosJson = await puestosRes.json();
        const todosPuestos = puestosJson.success ? puestosJson.data : puestosJson;
        const misPuestos = (todosPuestos || []).filter((p: any) => String(p.usuarioId) === String(userData.id));
>>>>>>> 23cae5ce1cac93a309b789a8f54cd0593a6c25f6
        
        await Promise.all(misPuestos.map((p: any) => 
          authFetch(`${ENDPOINTS.puestosProductor}/${p.id}`, { method: 'DELETE' })
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

<<<<<<< HEAD
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
=======
  const handleConvertirseEnProductor = async () => {
>>>>>>> 23cae5ce1cac93a309b789a8f54cd0593a6c25f6
    try {
      setLoading(true);
      const [userRes, puestosRes, feriasRes] = await Promise.all([
        authFetch(`${ENDPOINTS.usuarios}/${userData.id}`),
        authFetch(ENDPOINTS.puestosProductor),
        authFetch(ENDPOINTS.ferias)
      ]);
      
      const currentFullUserJson = await userRes.json();
      const allPuestosJson = await puestosRes.json();
      const allFeriasJson = await feriasRes.json();
      
      const currentFullUser = currentFullUserJson.success ? currentFullUserJson.data : currentFullUserJson;
      const allPuestos = allPuestosJson.success ? allPuestosJson.data : allPuestosJson;
      const allFerias = allFeriasJson.success ? allFeriasJson.data : allFeriasJson;
      
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
        body: JSON.stringify({ role: 'Productor' })
      });

      const updatedUserRes = await authFetch(`${ENDPOINTS.usuarios}/${userData.id}`);
      const updatedUserJson = await updatedUserRes.json();
      const updatedUserData = updatedUserJson.success ? updatedUserJson.data : updatedUserJson;
      localStorage.setItem('user', JSON.stringify(updatedUserData));

      Swal.fire({
        icon: 'success',
        title: '¡Felicidades!',
        text: `Bienvenido a tu nuevo perfil de Productor en AgroMap.${mensajeFeria}`,
        confirmButtonColor: 'var(--verde-claro)',
      }).then(() => {
        navigate('/productor');
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
                <div className="input-box disabled">
                  <span className="input-icon">🔒</span>
                  <input
                    type="password"
                    value="••••••••"
                    readOnly
                    aria-label="Contraseña oculta"
                  />
                  <button
                    type="button"
                    className="change-password-btn"
                    onClick={handleChangePassword}
                  >
                    Cambiar contraseña
                  </button>
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
                          <li key={`${item.id || item.nombre}-${i}`}>
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

          {/* Solicitud para ser Productor - Solo se muestra si el usuario es cliente ('Usuario') */}
          {(userData.role && userData.role.toLowerCase() === 'usuario') && (
            <div className="role-request-section">
              <div className="separator"></div>
              <div className="role-request-content">
                <h3>Solicitud para ser Productor</h3>
                
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
                        onClick={() => navigate('/registro-productor')}
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
                      onClick={handleConvertirseEnProductor}
                      style={{width: '100%', maxWidth: '300px', margin: '0 auto', display: 'block'}}
                    >
                      Convertirse en productor
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
                      onClick={() => navigate('/registro-productor?reset=true')}
                    >
                      Enviar nueva solicitud
                    </button>
                  </>
                )}

                {!agricultorRequest && (
                  <>
                    <p>Completá el formulario con los datos de tu puesto para solicitar el cambio de rol a Productor. Un administrador revisará tu solicitud.</p>
                    <button 
                      type="button" 
                      className="role-request-btn"
                      onClick={() => navigate('/registro-productor')}
                    >
                      Solicitar ser Productor
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
