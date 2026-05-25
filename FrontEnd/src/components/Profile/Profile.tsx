import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { Camera, User as UserIcon, Mail, ShoppingCart, Bell, Moon, LogOut, ArrowRight } from 'lucide-react';
import Navbar from '../Navbar';
import Footer from '../Footer';
import { validateEmail } from '../../utils/validation';
import { ENDPOINTS, authFetch } from '../../services/api.config';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { usePreferences } from '../context/PreferencesContext';
import './Profile.css';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUserInContext, logout } = useAuth();
  const { proformas } = useCart();
  const { theme, toggleTheme } = useTheme();
  const { notifications, toggleNotifications } = usePreferences();
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
  const [productorRequest, setProductorRequest] = useState<any>(null);
  const [driverRequest, setDriverRequest] = useState<any>(null);
  const [originalData, setOriginalData] = useState({ ...userData });

  useEffect(() => {
    let cancelled = false;

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
        setOriginalData({ ...userInfo });

        return authFetch(ENDPOINTS.solicitudesCambioRol);
      })
      .then(res => res?.json())
      .then(json => {
        if (cancelled) return;
        if (json) {
          const allRequests = json.success ? json.data : json;
          const userRequests = (allRequests || []).filter(
            (r: any) => String(r.usuario_id || r.usuarioId) === String(currentId)
          ).sort((a: any, b: any) => new Date(b.fecha_solicitud || b.fechaSolicitud).getTime() - new Date(a.fecha_solicitud || a.fechaSolicitud).getTime());

          const agRequests = userRequests.filter((r: any) => r.rol_solicitado === 'Productor' || r.rolSolicitado === 'Productor');
          if (agRequests.length > 0) {
            let activeRequest = agRequests[0];
            const aprobada = agRequests.find((r: any) => r.estado === 'Aprobada');
            const pendiente = agRequests.find((r: any) => r.estado === 'Pendiente');
            const rechazada = agRequests.find((r: any) => r.estado === 'Rechazada');
            if (aprobada) activeRequest = aprobada;
            else if (pendiente) activeRequest = pendiente;
            else if (rechazada) activeRequest = rechazada;
            setProductorRequest(activeRequest);
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
        if (cancelled) return;
        console.error('Error fetching user profile:', err);
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [user, navigate]);

  // Polling de estado para solicitud Productor (preservado del original)
  useEffect(() => {
    if (!productorRequest || productorRequest.estado !== 'Pendiente') return;
    const currentId = user?.id || JSON.parse(localStorage.getItem('user') || '{}').id;
    if (!currentId) return;

    let stopped = false;
    const interval = setInterval(async () => {
      try {
        const res = await authFetch(ENDPOINTS.solicitudesCambioRol);
        const json = await res.json();
        const all = json?.success ? json.data : json;
        const mine = (all || [])
          .filter((r: any) => String(r.usuario_id || r.usuarioId) === String(currentId))
          .find((r: any) => String(r.id) === String(productorRequest.id));
        if (stopped || !mine || mine.estado === productorRequest.estado) return;

        setProductorRequest(mine);

        if (mine.estado === 'Aprobada') {
          try {
            const userRes = await authFetch(`${ENDPOINTS.usuarios}/${currentId}`);
            const userJson = await userRes.json();
            const fresh = userJson.success ? userJson.data : userJson;
            const updated = {
              id: fresh.id,
              name: fresh.name || fresh.nombre || '',
              nombre: fresh.nombre || fresh.name || '',
              email: fresh.email,
              role: fresh.role || fresh.rol?.nombre || '',
              status: fresh.status,
              avatar: fresh.avatar || ''
            };
            setUserData(updated);
            setOriginalData(updated);
            updateUserInContext(fresh);
          } catch (e) {
            console.warn('No se pudo refrescar el usuario tras aprobación:', e);
          }
        }
      } catch (err) {
        console.warn('[polling solicitud] error:', err);
      }
    }, 5000);

    return () => { stopped = true; clearInterval(interval); };
  }, [productorRequest?.id, productorRequest?.estado, user, updateUserInContext]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditToggle = () => {
    if (isEditing) {
      setUserData(originalData);
    }
    setIsEditing(!isEditing);
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
        confirmButtonColor: '#52b788',
      });
      return;
    }

    const emailValidation = validateEmail(trimmedEmail);
    if (!emailValidation.valid) {
      Swal.fire({
        icon: 'error',
        title: 'Correo inválido',
        text: emailValidation.message,
        confirmButtonColor: '#52b788',
      });
      return;
    }

    try {
      const fullUserResponse = await authFetch(`${ENDPOINTS.usuarios}/${userData.id}`);
      const fullUserJson = await fullUserResponse.json();
      const fullUserData = fullUserJson.success ? fullUserJson.data : fullUserJson;

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
          confirmButtonColor: '#52b788',
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
            confirmButtonColor: '#52b788',
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
        confirmButtonColor: '#52b788',
      });
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      Swal.fire('Error', 'Por favor selecciona una imagen válida.', 'error');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      Swal.fire('Error', 'La imagen es demasiado grande. Máximo 2MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Image = event.target?.result as string;
      try {
        setUserData(prev => ({ ...prev, avatar: base64Image }));
        updateUserInContext({ avatar: base64Image });

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
    const reqId = productorRequest?.id;
    if (!reqId) return;

    const { isConfirmed } = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Se cancelará esta solicitud para ser Productor y tendrás que volver a enviarla si cambiás de opinión.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#718096',
      confirmButtonText: 'Sí, cancelar solicitud',
      cancelButtonText: 'Volver'
    });

    if (isConfirmed) {
      try {
        await authFetch(`${ENDPOINTS.solicitudesCambioRol}/${reqId}`, { method: 'DELETE' });

        const puestosRes = await authFetch(ENDPOINTS.puestosProductor);
        const puestosJson = await puestosRes.json();
        const todosPuestos = puestosJson.success ? puestosJson.data : puestosJson;
        const misPuestos = (todosPuestos || []).filter((p: any) => String(p.usuarioId) === String(userData.id));
        await Promise.all(misPuestos.map((p: any) =>
          authFetch(`${ENDPOINTS.puestosProductor}/${p.id}`, { method: 'DELETE' })
        ));

        setProductorRequest(null);
        Swal.fire({
          icon: 'success',
          title: 'Solicitud cancelada',
          text: 'Tu solicitud y toda la información asociada han sido borradas correctamente.',
          confirmButtonColor: '#52b788',
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
      text: 'Se cancelará esta solicitud para ser Repartidor.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#718096',
      confirmButtonText: 'Sí, cancelar solicitud',
      cancelButtonText: 'Volver'
    });

    if (isConfirmed) {
      try {
        await authFetch(`${ENDPOINTS.solicitudesCambioRol}/${reqId}`, { method: 'DELETE' });
        setDriverRequest(null);
        Swal.fire({
          icon: 'success',
          title: 'Solicitud cancelada',
          text: 'Tu solicitud de repartidor ha sido cancelada correctamente.',
          confirmButtonColor: '#52b788',
        });
      } catch (error) {
        console.error('Error al cancelar solicitud de repartidor:', error);
        Swal.fire('Error', 'No se pudo cancelar la solicitud.', 'error');
      }
    }
  };

  const handleConvertirseEnProductor = async () => {
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
        confirmButtonColor: '#52b788',
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
        confirmButtonColor: '#52b788',
      }).then(() => {
        window.location.href = '/driver';
      });
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'No se pudo actualizar tu perfil.', 'error');
      setLoading(false);
    }
  };

  const handleLogoutFromProfile = async () => {
    const result = await Swal.fire({
      title: '¿Cerrar sesión?',
      text: '¿Estás seguro de que deseas salir de tu cuenta?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#52b788',
      cancelButtonColor: '#718096',
      confirmButtonText: 'Sí, cerrar sesión',
      cancelButtonText: 'Cancelar'
    });
    if (result.isConfirmed) {
      navigate('/');
      Promise.resolve().then(() => logout());
    }
  };

  const handleShowAllProformas = () => {
    if (proformas.length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'Sin compras aún',
        text: 'Cuando generes presupuestos aparecerán acá.',
        confirmButtonColor: '#52b788',
      });
      return;
    }
    const html = proformas.map((p) => `
      <div style="text-align:left;border:1px solid #e1e8fd;border-radius:12px;padding:12px;margin-bottom:10px;">
        <div style="display:flex;justify-content:space-between;font-size:0.85rem;color:#424843;margin-bottom:6px;">
          <strong style="color:#0d2818;">${p.id}</strong><span>${p.fecha}</span>
        </div>
        <ul style="margin:0 0 6px 0;padding-left:18px;color:#424843;font-size:0.9rem;">
          ${p.items.map(i => `<li>${i.emoji || ''} ${i.nombre} (x${i.cantidad}) - ₡${(i.precio * i.cantidad).toLocaleString()}</li>`).join('')}
        </ul>
        <div style="text-align:right;font-weight:700;color:#0d2818;">Total: ₡${p.total.toLocaleString()}</div>
      </div>
    `).join('');
    Swal.fire({
      title: 'Mi Historial de Compras',
      html: `<div style="max-height:55vh;overflow-y:auto;padding:0 4px;">${html}</div>`,
      width: '640px',
      confirmButtonText: 'Cerrar',
      confirmButtonColor: '#52b788',
    });
  };

  // ID legible derivado del id real
  const displayId = userData.id ? `#AM-${String(userData.id).padStart(4, '0')}` : '';
  const statusLabel = (userData.status || 'Activo').toUpperCase();
  const statusClass = (userData.status || 'Activo').toLowerCase();
  const isUsuarioRole = userData.role && userData.role.toLowerCase() === 'usuario';
  const canRequestDriver = !userData.role || (userData.role.toLowerCase() !== 'driver' && userData.role.toLowerCase() !== 'administrador');

  if (loading) {
    return (
      <div className="pn-profile-loading">
        <p>Cargando perfil...</p>
      </div>
    );
  }

  return (
    <div className="pn-profile-page">
      <Navbar />

      <main className="pn-profile-container">
        {/* Header centrado con avatar */}
        <div className="pn-profile-header">
          <div className="pn-profile-avatar-ring">
            <div className="pn-profile-avatar">
              {userData.avatar ? (
                <img src={userData.avatar} alt="Avatar" />
              ) : (
                <span>{(userData.name || userData.nombre || 'U').charAt(0).toUpperCase()}</span>
              )}
            </div>
            <label htmlFor="pn-avatar-upload" className="pn-profile-camera" title="Cambiar foto" aria-label="Cambiar foto">
              <Camera size={16} strokeWidth={2.2} />
              <input
                type="file"
                id="pn-avatar-upload"
                accept="image/*"
                onChange={handleAvatarChange}
                style={{ display: 'none' }}
              />
            </label>
          </div>
          <h1 className="pn-profile-title">Mi Perfil</h1>
        </div>

        {/* Layout 2 columnas */}
        <div className="pn-profile-grid">
          {/* Main */}
          <div className="pn-profile-main">
            {/* Datos personales */}
            <section className="pn-profile-card">
              <header className="pn-profile-card-header">
                <UserIcon size={18} strokeWidth={2.2} />
                <h2>Datos Personales</h2>
                {!isEditing ? (
                  <button type="button" className="pn-link-btn" onClick={handleEditToggle}>Editar</button>
                ) : (
                  <button type="button" className="pn-link-btn" onClick={handleEditToggle}>Cancelar</button>
                )}
              </header>

              <form onSubmit={handleSubmit} className="pn-profile-form">
                <div className="pn-profile-form-grid">
                  <div className="pn-input-group">
                    <label>Nombre completo</label>
                    <div className={`pn-input-box ${!isEditing ? 'disabled' : ''}`}>
                      <UserIcon size={16} strokeWidth={2} className="pn-input-icon" />
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

                  <div className="pn-input-group">
                    <label>Correo electrónico</label>
                    <div className={`pn-input-box ${!isEditing ? 'disabled' : ''}`}>
                      <Mail size={16} strokeWidth={2} className="pn-input-icon" />
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
                </div>

                <button
                  type="submit"
                  className="pn-btn-primary"
                  disabled={!isEditing || JSON.stringify(userData) === JSON.stringify(originalData)}
                >
                  Guardar cambios
                </button>
              </form>
            </section>

            {/* Historial de compras */}
            <section className="pn-profile-card">
              <header className="pn-profile-card-header">
                <ShoppingCart size={18} strokeWidth={2.2} />
                <h2>Mi Historial de Compras</h2>
                <button type="button" className="pn-link-btn" onClick={handleShowAllProformas}>
                  Ver todo
                </button>
              </header>

              {proformas.length === 0 ? (
                <div className="pn-empty-state">
                  <ShoppingCart size={36} strokeWidth={1.6} />
                  <p>Aún no tienes compras o presupuestos generados.</p>
                  <button type="button" className="pn-link-btn" onClick={() => navigate('/ferias')}>
                    Explorar ferias cercanas
                  </button>
                </div>
              ) : (
                <ul className="pn-history-list">
                  {proformas.slice(0, 3).map((p) => (
                    <li key={p.id} className="pn-history-item">
                      <div className="pn-history-head">
                        <strong>{p.id}</strong>
                        <span>{p.fecha}</span>
                      </div>
                      <div className="pn-history-total">Total: <strong>₡{p.total.toLocaleString()}</strong></div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          {/* Side */}
          <aside className="pn-profile-side">
            {/* Productor */}
            {isUsuarioRole && (
              <section className="pn-profile-dark-card">
                <h3>¿Eres Productor?</h3>
                <p>Únete a nuestra red y ofrece tus productos directamente a la comunidad.</p>

                {!productorRequest && (
                  <button className="pn-btn-accent" onClick={() => navigate('/registro-productor')}>
                    Solicitar ser Productor <ArrowRight size={16} />
                  </button>
                )}

                {productorRequest?.estado === 'Pendiente' && (
                  <div className="pn-role-status pending">
                    <span className="pn-role-status-label">Solicitud pendiente</span>
                    <div className="pn-role-actions">
                      <button className="pn-btn-secondary" onClick={() => navigate('/registro-productor')}>Editar</button>
                      <button className="pn-btn-danger" onClick={handleCancelarSolicitud}>Cancelar</button>
                    </div>
                  </div>
                )}

                {productorRequest?.estado === 'Aprobada' && (
                  <div className="pn-role-status approved">
                    <span className="pn-role-status-label">Aprobada</span>
                    {productorRequest.motivo_respuesta && <p className="pn-role-note">"{productorRequest.motivo_respuesta}"</p>}
                    <button className="pn-btn-accent" onClick={handleConvertirseEnProductor}>
                      Convertirse en productor <ArrowRight size={16} />
                    </button>
                  </div>
                )}

                {productorRequest?.estado === 'Rechazada' && (
                  <div className="pn-role-status rejected">
                    <span className="pn-role-status-label">Rechazada</span>
                    {productorRequest.motivo_respuesta && <p className="pn-role-note">"{productorRequest.motivo_respuesta}"</p>}
                    <button className="pn-btn-accent" onClick={() => navigate('/registro-productor?reset=true')}>
                      Enviar nueva solicitud <ArrowRight size={16} />
                    </button>
                  </div>
                )}
              </section>
            )}

            {/* Delivery */}
            {canRequestDriver && (
              <section className="pn-profile-dark-card">
                <h3>¿Querés ser Delivery?</h3>
                <p>Unite a nuestra red de repartidores y ayudá a llevar la frescura del campo a los hogares.</p>

                {!driverRequest && (
                  <button className="pn-btn-accent" onClick={() => navigate('/registro-delivery')}>
                    Solicitar ser Delivery <ArrowRight size={16} />
                  </button>
                )}

                {driverRequest?.estado === 'Pendiente' && (
                  <div className="pn-role-status pending">
                    <span className="pn-role-status-label">Solicitud pendiente</span>
                    <div className="pn-role-actions">
                      <button className="pn-btn-secondary" onClick={() => navigate('/registro-delivery')}>Editar</button>
                      <button className="pn-btn-danger" onClick={handleCancelarSolicitudDriver}>Cancelar</button>
                    </div>
                  </div>
                )}

                {driverRequest?.estado === 'Aprobada' && (
                  <div className="pn-role-status approved">
                    <span className="pn-role-status-label">Aprobada</span>
                    {driverRequest.motivo_respuesta && <p className="pn-role-note">"{driverRequest.motivo_respuesta}"</p>}
                    <button className="pn-btn-accent" onClick={handleConvertirseEnDriver}>
                      Convertirse en repartidor <ArrowRight size={16} />
                    </button>
                  </div>
                )}

                {driverRequest?.estado === 'Rechazada' && (
                  <div className="pn-role-status rejected">
                    <span className="pn-role-status-label">Rechazada</span>
                    {driverRequest.motivo_respuesta && <p className="pn-role-note">"{driverRequest.motivo_respuesta}"</p>}
                    <button className="pn-btn-accent" onClick={() => navigate('/registro-delivery?reset=true')}>
                      Enviar nueva solicitud <ArrowRight size={16} />
                    </button>
                  </div>
                )}
              </section>
            )}

            {/* Preferencias */}
            <section className="pn-profile-card pn-preferences-card">
              <h3 className="pn-preferences-title">PREFERENCIAS</h3>

              <div className="pn-pref-row">
                <span className="pn-pref-icon"><Bell size={18} strokeWidth={2} /></span>
                <span className="pn-pref-label">Notificaciones</span>
                <button
                  type="button"
                  className={`pn-toggle ${notifications ? 'on' : ''}`}
                  onClick={toggleNotifications}
                  aria-label="Activar notificaciones"
                  aria-pressed={notifications}
                >
                  <span className="pn-toggle-thumb" />
                </button>
              </div>

              <div className="pn-pref-row">
                <span className="pn-pref-icon"><Moon size={18} strokeWidth={2} /></span>
                <span className="pn-pref-label">Modo Oscuro</span>
                <button
                  type="button"
                  className={`pn-toggle ${theme === 'dark' ? 'on' : ''}`}
                  onClick={toggleTheme}
                  aria-label="Activar modo oscuro"
                  aria-pressed={theme === 'dark'}
                >
                  <span className="pn-toggle-thumb" />
                </button>
              </div>

              <button type="button" className="pn-logout-btn" onClick={handleLogoutFromProfile}>
                <LogOut size={16} strokeWidth={2.2} /> Cerrar sesión
              </button>
            </section>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
