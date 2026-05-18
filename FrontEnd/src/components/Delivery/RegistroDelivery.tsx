import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import './RegistroDelivery.css';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import { ENDPOINTS, authFetch } from '../../services/api.config';
import { validateEmail } from '../../utils/validation';

const VEHICLE_TYPES = [
  { value: 'Moto', label: 'Motocicleta 🏍️' },
  { value: 'Carro', label: 'Automóvil / Carro 🚗' },
  { value: 'Bicicleta', label: 'Bicicleta 🚲' },
  { value: 'Otro', label: 'Otro / A pie 🚶' }
];

const RegistroDelivery: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userId, setUserId] = useState('');
  const [role, setRole] = useState('');
  
  const isReset = new URLSearchParams(location.search).get('reset') === 'true';

  const [solicitudEnviada, setSolicitudEnviada] = useState(false);
  const [solicitudId, setSolicitudId] = useState('');

  // Form Fields
  const [vehicleType, setVehicleType] = useState('Moto');
  const [licensePlate, setLicensePlate] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [nombre, setNombre] = useState('');

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      navigate('/auth');
      return;
    }

    const cachedUser = JSON.parse(userStr);

    if (cachedUser.role !== 'Cliente' && cachedUser.role !== 'Usuario' && cachedUser.role !== 'DRIVER') {
      navigate('/perfil');
      return;
    }

    setRole(cachedUser.role);
    setUserId(cachedUser.id);
    setEmail(cachedUser.email || '');
    setNombre(cachedUser.name || cachedUser.nombre || '');

    const cargarDatos = async () => {
      try {
        setLoading(true);

        if (isReset) {
          setLoading(false);
          return;
        }

        // Buscar solicitud pendiente de DRIVER
        const solRes = await authFetch(ENDPOINTS.solicitudesCambioRol);
        const todasSolicitudesRaw = await solRes.json();
        const todasSolicitudes = todasSolicitudesRaw.data || todasSolicitudesRaw;
        const misSolicitudes = todasSolicitudes.filter(
          (s: any) => String(s.usuarioId) === String(cachedUser.id) && s.rolSolicitado === 'DRIVER' && s.estado === 'Pendiente'
        );

        if (misSolicitudes.length > 0) {
          const laSol = misSolicitudes[0];
          setSolicitudEnviada(true);
          setSolicitudId(laSol.id);
          setVehicleType(laSol.vehicleType || 'Moto');
          setLicensePlate(laSol.licensePlate || '');
        }
      } catch (error) {
        console.error('Error al cargar datos de solicitud de delivery:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [navigate, isReset]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!vehicleType || !telefono.trim() || !nombre.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Por favor, completá todos los campos obligatorios.',
        confirmButtonColor: 'var(--verde-claro)',
      });
      return;
    }

    if (telefono.trim().length !== 8) {
      Swal.fire({
        icon: 'warning',
        title: 'Teléfono inválido',
        text: 'El número de teléfono debe tener exactamente 8 dígitos.',
        confirmButtonColor: 'var(--verde-claro)',
      });
      return;
    }

    if (vehicleType !== 'Bicicleta' && vehicleType !== 'Otro' && !licensePlate.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Placa requerida',
        text: 'Por favor ingresá el número de placa de tu vehículo.',
        confirmButtonColor: 'var(--verde-claro)',
      });
      return;
    }

    const emailValidation = validateEmail(email.trim());
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
      setSubmitting(true);

      const solicitudData = {
        usuario_id: userId,
        nombre_usuario: nombre.trim(),
        correo_usuario: email.trim(),
        rol_solicitado: 'DRIVER',
        vehicle_type: vehicleType,
        license_plate: licensePlate.trim(),
        estado: 'Pendiente',
        fecha_solicitud: new Date().toISOString()
      };

      if (!solicitudId) {
        // Crear solicitud nueva
        const solRes = await authFetch(ENDPOINTS.solicitudesCambioRol, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(solicitudData)
        });

        if (!solRes.ok) throw new Error('Error al crear solicitud');
        const nuevaSolicitud = await solRes.json();
        setSolicitudId(nuevaSolicitud.data ? nuevaSolicitud.data.id : nuevaSolicitud.id);
      } else {
        // Actualizar solicitud
        const solRes = await authFetch(`${ENDPOINTS.solicitudesCambioRol}/${solicitudId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            vehicle_type: vehicleType,
            license_plate: licensePlate.trim(),
            correo_usuario: email.trim(),
            nombre_usuario: nombre.trim(),
            estado: 'Pendiente',
            fecha_solicitud: new Date().toISOString()
          })
        });
        if (!solRes.ok) throw new Error('Error al actualizar solicitud');
      }

      setSolicitudEnviada(true);

      Swal.fire({
        icon: 'success',
        title: solicitudId ? '¡Solicitud actualizada!' : '¡Solicitud enviada!',
        text: 'Tu solicitud para ser Repartidor ha sido enviada y será revisada por un administrador.',
        confirmButtonColor: 'var(--verde-claro)',
      }).then(() => {
        navigate('/perfil');
      });

    } catch (error) {
      console.error('Error al enviar solicitud de repartidor:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un problema al procesar tu solicitud. Intentá de nuevo.',
        confirmButtonColor: 'var(--verde-claro)',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-page-loading">
        <p>Cargando formulario...</p>
      </div>
    );
  }

  return (
    <div className="registro-delivery-page">
      <Navbar />

      <main className="registro-delivery-container">
        <div className="registro-delivery-card animate-fade">
          <div className="profile-header">
            <div className="header-info">
              <h1>{role === 'DRIVER' ? 'Información de Repartidor' : 'Registro de Repartidor'}</h1>
              <p>Completá los datos de tu vehículo e información personal para que un administrador pueda revisar tu solicitud.</p>
            </div>
          </div>

          {solicitudEnviada && (
            <div className="solicitud-status-banner pending">
              <span className="status-icon">⏳</span>
              <div>
                <strong>Solicitud pendiente de aprobación</strong>
                <p>Tu solicitud está siendo revisada por un administrador. Podés editar la información mientras tanto.</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="registro-delivery-form">
            <div className="registro-delivery-grid">
              
              <h3 className="form-section-title">Detalles del Vehículo</h3>

              <div className="input-group">
                <label>Tipo de Vehículo *</label>
                <div className="input-box">
                  <span className="input-icon">🚗</span>
                  <select
                    value={vehicleType}
                    onChange={(e) => {
                      setVehicleType(e.target.value);
                      if (e.target.value === 'Bicicleta' || e.target.value === 'Otro') {
                        setLicensePlate('');
                      }
                    }}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', outline: 'none' }}
                  >
                    {VEHICLE_TYPES.map((vt) => (
                      <option key={vt.value} value={vt.value}>{vt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {vehicleType !== 'Bicicleta' && vehicleType !== 'Otro' && (
                <div className="input-group">
                  <label>Número de Placa *</label>
                  <div className="input-box">
                    <span className="input-icon">🔢</span>
                    <input
                      type="text"
                      placeholder="Ej: ABC-123 o 123456"
                      value={licensePlate}
                      onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
                    />
                  </div>
                </div>
              )}

              <h3 className="form-section-title">Información de Contacto</h3>

              <div className="input-group">
                <label>Nombre Completo *</label>
                <div className="input-box">
                  <span className="input-icon">👤</span>
                  <input
                    type="text"
                    placeholder="Tu nombre"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Teléfono (8 dígitos) *</label>
                <div className="input-box">
                  <span className="input-icon">📞</span>
                  <input
                    type="tel"
                    placeholder="Ej: 88888888"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value.replace(/[^0-9]/g, '').slice(0, 8))}
                    maxLength={8}
                  />
                </div>
              </div>

              <div className="input-group full-width">
                <label>Correo Electrónico *</label>
                <div className="input-box">
                  <span className="input-icon">✉️</span>
                  <input
                    type="email"
                    placeholder="tucorreo@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

            </div>

            <div className="registro-delivery-actions">
              <button
                type="submit"
                className="save-btn"
                disabled={submitting}
                style={submitting ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
              >
                {submitting
                  ? 'Guardando...'
                  : solicitudEnviada
                    ? 'Actualizar solicitud'
                    : 'Enviar solicitud de Repartidor'
                }
              </button>
              <button type="button" className="cancel-btn" onClick={() => navigate('/perfil')}>
                Volver al perfil
              </button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RegistroDelivery;
