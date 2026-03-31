import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import './RegistroAgricultor.css';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import { ENDPOINTS } from '../../services/api.config';
import { validateEmail } from '../../utils/validation';
import ProductIcon from '../../utils/productIcons';
import CategoryIcon from '../CategoryIcon/CategoryIcon';

// Opciones de tipo de productos
const TIPOS_PRODUCTO = [
  { value: 'Verduras' },
  { value: 'Frutas' },
  { value: 'Hierbas' },
  { value: 'Tubérculos' },
  { value: 'Granos' },
  { value: 'Proteína' },
  { value: 'Lácteos' },
];

interface FotoPreview {
  file: File;
  preview: string;
}

interface HorarioItem {
  dia: string;
  inicio: string;
  fin: string;
}

const RegistroAgricultor: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userId, setUserId] = useState('');
  const [role, setRole] = useState('');
  
  // Parámetro para reiniciar formulario
  const isReset = new URLSearchParams(location.search).get('reset') === 'true';

  // Estado del formulario enviado (solicitud pendiente)
  const [solicitudEnviada, setSolicitudEnviada] = useState(false);
  const [puestoId, setPuestoId] = useState('');
  const [solicitudId, setSolicitudId] = useState('');

  // Campos obligatorios
  const [nombrePuesto, setNombrePuesto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [selectedFeriaId, setSelectedFeriaId] = useState('');
  const [ferias, setFerias] = useState<any[]>([]);
  const [tiposProducto, setTiposProducto] = useState<string[]>([]);
  const [fotos, setFotos] = useState<FotoPreview[]>([]);
  const [fotosExistentes, setFotosExistentes] = useState<string[]>([]);
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');

  // Campos opcionales
  const [horariosList, setHorariosList] = useState<HorarioItem[]>([]);
  const [metodosCultivo, setMetodosCultivo] = useState('');
  const [redesSociales, setRedesSociales] = useState('');

  // Estados de expansión de secciones
  const [feriaExpanded, setFeriaExpanded] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      navigate('/auth');
      return;
    }

    const cachedUser = JSON.parse(userStr);

    // Solo clientes, usuarios o agricultores pueden acceder a esta página
    if (cachedUser.role !== 'Cliente' && cachedUser.role !== 'Usuario' && cachedUser.role !== 'Agricultor') {
      navigate('/perfil');
      return;
    }

    setRole(cachedUser.role);
    const currentUserId = cachedUser.id;
    setUserId(currentUserId);
    setEmail(cachedUser.email || '');

    // Cargar datos existentes y ferias
    const cargarDatos = async () => {
      try {
        setLoading(true);
        // Cargar ferias y deduplicar
        const feriasRes = await fetch(ENDPOINTS.ferias);
        const dataFerias = await feriasRes.json();
        
        // Deduplicar ferias por nombre para evitar repeticiones visuales
        const feriasUnicas = dataFerias.filter((feria: any, index: number, self: any[]) =>
          index === self.findIndex((f) => f.name === feria.name)
        );
          setFerias(feriasUnicas);
  
          // Si estamos en modo reinicio (nueva solicitud tras rechazo), no cargamos datos existentes
          if (isReset) {
            setLoading(false);
            return;
          }
  
          // Buscar puesto existente
          const puestoRes = await fetch(ENDPOINTS.puestosAgricultor);
          const todosPuestos = await puestoRes.json();
          const misPuestos = todosPuestos.filter((p: { usuarioId: string | number }) => String(p.usuarioId) === String(currentUserId));
  
          if (misPuestos.length > 0) {
            const puesto = misPuestos[misPuestos.length - 1];
            setPuestoId(puesto.id);
            setNombrePuesto(puesto.nombrePuesto || '');
            setDescripcion(puesto.descripcion || '');
            setSelectedFeriaId(String(puesto.feriaId || ''));
            setTiposProducto(puesto.tiposProducto || []);
            const fotosGuardadas = puesto.fotosNombres || (puesto.logoNombre ? [puesto.logoNombre] : []);
            setFotosExistentes(fotosGuardadas);
            setTelefono(puesto.telefono || '');
            setEmail(puesto.email || cachedUser.email || '');
            if (puesto.horariosList && Array.isArray(puesto.horariosList)) {
              setHorariosList(puesto.horariosList);
            }
            setMetodosCultivo(puesto.metodosCultivo || '');
            setRedesSociales(puesto.redesSociales || '');
          }
  
          // Buscar solicitud pendiente
          const solRes = await fetch(ENDPOINTS.solicitudesCambioRol);
          const todasSolicitudes = await solRes.json();
          const misSolicitudes = todasSolicitudes.filter(
            (s: { usuarioId: string | number; estado: string }) => String(s.usuarioId) === String(currentUserId) && s.estado === 'Pendiente'
          );
          if (misSolicitudes.length > 0) {
            setSolicitudEnviada(true);
            setSolicitudId(misSolicitudes[0].id);
          }
        } catch (error) {
          console.error('Error al cargar datos:', error);
        } finally {
          setLoading(false);
        }
      };
  
      cargarDatos();
    }, [navigate, setEmail, isReset]);


  const handleToggleProducto = (tipo: string) => {
    setTiposProducto(prev =>
      prev.includes(tipo) ? prev.filter(t => t !== tipo) : [...prev, tipo]
    );
  };

  const handleSelectFeria = (fId: string) => {
    setSelectedFeriaId(fId);
  };

  const handleFotosChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const validFormats = ['image/jpeg', 'image/png', 'image/webp'];
    const disponibles = 6 - fotos.length - fotosExistentes.length;

    const archivosValidos: File[] = [];
    for (let i = 0; i < files.length; i++) {
      if (!validFormats.includes(files[i].type)) {
        Swal.fire({
          icon: 'error',
          title: 'Formato no válido',
          text: `"${files[i].name}" no es válido. Solo JPG, PNG o WebP.`,
          confirmButtonColor: 'var(--verde-claro)',
        });
      } else {
        archivosValidos.push(files[i]);
      }
    }

    const archivosASubir = archivosValidos.slice(0, disponibles);

    const leerArchivo = (file: File): Promise<FotoPreview> => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve({ file, preview: reader.result as string });
        reader.readAsDataURL(file);
      });
    };

    const nuevasFotos = await Promise.all(archivosASubir.map(leerArchivo));
    setFotos(prev => [...prev, ...nuevasFotos]);

    e.target.value = '';
  };

  const handleRemoveFoto = (index: number) => {
    setFotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveFotoExistente = (index: number) => {
    setFotosExistentes(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones obligatorias
    if (!nombrePuesto.trim() || !descripcion.trim() || !selectedFeriaId || tiposProducto.length === 0 || (fotos.length === 0 && fotosExistentes.length === 0) || !telefono.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Por favor, completá todos los campos obligatorios del formulario.',
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

    if (tiposProducto.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Tipo de productos',
        text: 'Seleccioná al menos un tipo de producto que ofrecés.',
        confirmButtonColor: 'var(--verde-claro)',
      });
      return;
    }

    const totalFotos = fotos.length + fotosExistentes.length;
    if (totalFotos === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Fotos requeridas',
        text: 'Por favor, subí al menos una foto de tu puesto o productos.',
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
      // Buscar el nombre de la feria seleccionada para guardar en el array retrocompatible
      const feriaSeleccionada = ferias.find(f => String(f.id) === String(selectedFeriaId));
      const ubicacionNombre = feriaSeleccionada ? feriaSeleccionada.name : '';

      const fotosNombres = [
        ...fotosExistentes,
        ...fotos.map(f => f.file.name)
      ];

      const fotosBase64 = fotos.map(f => f.preview);

      const puestoData = {
        usuarioId: userId,
        nombrePuesto: nombrePuesto.trim(),
        descripcion: descripcion.trim(),
        ubicacion: [ubicacionNombre],
        feriaId: selectedFeriaId,
        tiposProducto,
        fotosNombres,
        fotosBase64,
        telefono: telefono.trim(),
        email: email.trim(),
        horarios: horariosList.length > 0 ? horariosList.map(h => `${h.dia} de ${h.inicio} a ${h.fin}`).join(', ') : '',
        horariosList: horariosList,
        metodosCultivo: metodosCultivo.trim(),
        redesSociales: redesSociales.trim(),
        fechaRegistro: new Date().toISOString()
      };

      if (puestoId) {
        // Actualizar puesto existente
        const puestoRes = await fetch(`${ENDPOINTS.puestosAgricultor}/${puestoId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(puestoData)
        });
        if (!puestoRes.ok) throw new Error('Error al actualizar puesto');
      } else {
        // Crear puesto nuevo
        const puestoRes = await fetch(ENDPOINTS.puestosAgricultor, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(puestoData)
        });
        if (!puestoRes.ok) throw new Error('Error al guardar puesto');
        const nuevoPuesto = await puestoRes.json();
        setPuestoId(nuevoPuesto.id);
      }
  
      // Si el usuario es un AGRICULTOR ya activo, NO creamos ni actualizamos solicitudes.
      // Simplemente actualizamos el puesto y terminamos.
      if (role === 'Agricultor') {
        Swal.fire({
          icon: 'success',
          title: '¡Información actualizada!',
          text: 'Los datos de tu puesto han sido actualizados correctamente.',
          confirmButtonColor: 'var(--verde-claro)',
        }).then(() => {
          navigate('/agricultor');
        });
        return;
      }

      // Crear o actualizar solicitud de cambio de rol (Solo para Usuario/Cliente)
      if (!solicitudId) {
        const solicitudData = {
          usuarioId: userId,
          nombreDelPuesto: nombrePuesto.trim(),
          correoUsuario: email.trim(),
          rolSolicitado: 'Agricultor',
          estado: 'Pendiente',
          motivoRespuesta: '',
          fechaSolicitud: new Date().toISOString()
        };
  
        const solRes = await fetch(ENDPOINTS.solicitudesCambioRol, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(solicitudData)
        });
  
        if (!solRes.ok) throw new Error('Error al crear solicitud');
        
        const nuevaSolicitud = await solRes.json();
        setSolicitudId(nuevaSolicitud.id);
      } else {
        // Si ya existía una solicitud (modo edición), nos aseguramos de que esté en Pendiente
        // y actualizamos sus datos básicos
        const solRes = await fetch(`${ENDPOINTS.solicitudesCambioRol}/${solicitudId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nombreDelPuesto: nombrePuesto.trim(),
            correoUsuario: email.trim(),
            estado: 'Pendiente',
            fechaSolicitud: new Date().toISOString()
          })
        });
        if (!solRes.ok) throw new Error('Error al actualizar solicitud');
      }

      setSolicitudEnviada(true);
      setFotosExistentes(fotosNombres);
      setFotos([]);

      Swal.fire({
        icon: 'success',
        title: solicitudId ? '¡Solicitud actualizada!' : '¡Solicitud enviada!',
        text: role === 'Agricultor' ? 'Información actualizada.' : 'Tu solicitud para ser Agricultor ha sido enviada y será revisada por un administrador.',
        confirmButtonColor: 'var(--verde-claro)',
      }).then(() => {
        navigate(role === 'Agricultor' ? '/agricultor' : '/perfil');
      });
  
    } catch (error) {
      console.error('Error detallado en handleSubmit:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un problema al procesar tu solicitud. Intentá de nuevo.',
        footer: 'Asegurate de que las imágenes no sean demasiado pesadas.',
        confirmButtonColor: 'var(--verde-claro)',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-page-loading">
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <div className="registro-agricultor-page">
      <Navbar />

      <main className="registro-agricultor-container">
        <div className="registro-agricultor-card animate-fade">
          <div className="profile-header">
            <div className="header-info">
              <h1>{role === 'Agricultor' ? 'Gestionar Información' : 'Registro de Agricultor'}</h1>
              <p>{role === 'Agricultor' ? 'Mantené actualizados los datos de tu puesto y feria.' : 'Completá los datos de tu puesto para que un administrador pueda revisar tu solicitud.'}</p>
            </div>
          </div>

          {/* Banner de estado pendiente */}
          {solicitudEnviada && (
            <div className="solicitud-status-banner pending">
              <span className="status-icon">⏳</span>
              <div>
                <strong>Solicitud pendiente de aprobación</strong>
                <p>Tu solicitud está siendo revisada por un administrador. Podés editar la información mientras tanto.</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="registro-agricultor-form">
            <div className="registro-agricultor-grid">

              {/* === INFORMACIÓN DEL PUESTO === */}
              <h3 className="form-section-title">Información del puesto</h3>

              <div className="input-group">
                <label>Nombre del puesto *</label>
                <div className="input-box">
                  <span className="input-icon">🏪</span>
                  <input
                    type="text"
                    placeholder="Ej: Puesto Don Carlos"
                    value={nombrePuesto}
                    onChange={(e) => setNombrePuesto(e.target.value)}
                  />
                </div>
              </div>

              <div className="input-group full-width" style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1rem', background: '#f8fafc' }}>
                <button 
                  type="button" 
                  onClick={() => setFeriaExpanded(!feriaExpanded)}
                  className="section-toggle-btn"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    background: 'none',
                    border: 'none',
                    padding: '0',
                    cursor: 'pointer',
                    color: 'var(--verde-oscuro)',
                    fontWeight: '600'
                  }}
                >
                  <label style={{ cursor: 'pointer', margin: 0 }}>
                    📍 Feria en la cual desea vender * 
                    {selectedFeriaId && (
                      <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '400', marginLeft: '10px' }}>
                        (Seleccionada: {ferias.find(f => String(f.id) === String(selectedFeriaId))?.name})
                      </span>
                    )}
                  </label>
                  <span style={{ transition: 'transform 0.3s', transform: feriaExpanded ? 'rotate(180deg)' : 'rotate(0)' }}>
                    ▼
                  </span>
                </button>

                {feriaExpanded && (
                  <div className="productos-grid animate-fade" style={{ marginTop: '1.5rem' }}>
                    {ferias.map((f) => (
                      <label
                        key={f.id}
                        className={`producto-chip ${String(selectedFeriaId) === String(f.id) ? 'selected' : ''}`}
                      >
                        <input
                          type="radio"
                          name="feria-selection"
                          checked={String(selectedFeriaId) === String(f.id)}
                          onChange={() => handleSelectFeria(String(f.id))}
                        />
                        <span className="chip-check radio">
                          <div className="radio-inner" />
                        </span>
                        <span className="chip-icon">📍</span>
                        <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                          <span style={{ fontWeight: '600' }}>{f.name}</span>
                          <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>{f.location}, {f.province}</span>
                          {f.ubicacion && (
                            <a 
                              href={f.ubicacion} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              onClick={(e) => e.stopPropagation()}
                              style={{ fontSize: '0.75rem', color: '#3b82f6', textDecoration: 'underline', marginTop: '4px' }}
                            >
                              Ver mapa 🗺️
                            </a>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div className="input-group full-width">
                <label>Descripción *</label>
                <div className="input-box">
                  <textarea
                    placeholder="Describí brevemente tu puesto y lo que ofrecés..."
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                  />
                </div>
              </div>

              {/* === TIPO DE PRODUCTOS === */}
              <div className="input-group full-width">
                <label>Tipo de productos que ofrecés *</label>
                <div className="productos-grid">
                  {TIPOS_PRODUCTO.map((tipo) => (
                    <label
                      key={tipo.value}
                      className={`producto-chip ${tiposProducto.includes(tipo.value) ? 'selected' : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={tiposProducto.includes(tipo.value)}
                        onChange={() => handleToggleProducto(tipo.value)}
                      />
                      <span className="chip-check">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </span>
                      <span className="chip-icon">
                        <CategoryIcon categoria={tipo.value} size={18} />
                      </span>
                      <span>{tipo.value}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* === FOTOS === */}
              <div className="input-group full-width">
                <label>Fotos del puesto y productos * (JPG, PNG o WebP · Máx 6 fotos)</label>
                
                {/* Fotos existentes (ya guardadas) */}
                {fotosExistentes.length > 0 && (
                  <div className="fotos-preview-grid">
                    {fotosExistentes.map((nombre, i) => (
                      <div key={`existente-${i}`} className="foto-preview-item">
                        <div className="foto-name">📄 {nombre}</div>
                        <button type="button" className="logo-remove-btn" onClick={() => handleRemoveFotoExistente(i)}>
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Fotos nuevas seleccionadas */}
                {fotos.length > 0 && (
                  <div className="fotos-preview-grid">
                    {fotos.map((foto, i) => (
                      <div key={`nueva-${i}`} className="foto-preview-item">
                        <img src={foto.preview} alt={`Foto ${i + 1}`} />
                        <span>{foto.file.name}</span>
                        <button type="button" className="logo-remove-btn" onClick={() => handleRemoveFoto(i)}>
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Botón para agregar más fotos */}
                {(fotos.length + fotosExistentes.length) < 6 && (
                  <label className="logo-upload-area">
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp"
                      multiple
                      onChange={handleFotosChange}
                      style={{ display: 'none' }}
                    />
                    <div className="logo-upload-icon">📷</div>
                    <div className="logo-upload-text">
                      <strong>Hacé clic</strong> para seleccionar imágenes
                    </div>
                    <div className="logo-upload-formats">
                      JPG, PNG o WebP · {6 - fotos.length - fotosExistentes.length} foto(s) restante(s)
                    </div>
                  </label>
                )}
              </div>

              {/* === CONTACTO === */}
              <h3 className="form-section-title">Contacto</h3>

              <div className="input-group">
                <label>Teléfono *</label>
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

              <div className="input-group">
                <label>Correo electrónico *</label>
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

              {/* === INFORMACIÓN OPCIONAL === */}
              <h3 className="form-section-title">Información adicional (opcional)</h3>

              <div className="input-group full-width">
                <label>Horarios de atención</label>
                {horariosList.map((h, i) => (
                  <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <select 
                      value={h.dia} 
                      onChange={(e) => {
                        const newList = [...horariosList];
                        newList[i].dia = e.target.value;
                        setHorariosList(newList);
                      }}
                      style={{ flex: 1, minWidth: '120px', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', outline: 'none' }}
                    >
                      {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                    <span style={{ fontWeight: '600', color: '#666' }}>De:</span>
                    <input 
                      type="time" 
                      value={h.inicio} 
                      onChange={(e) => {
                        const newList = [...horariosList];
                        newList[i].inicio = e.target.value;
                        setHorariosList(newList);
                      }}
                      style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc', outline: 'none' }}
                    />
                    <span style={{ fontWeight: '600', color: '#666' }}>a:</span>
                    <input 
                      type="time" 
                      value={h.fin} 
                      onChange={(e) => {
                        const newList = [...horariosList];
                        newList[i].fin = e.target.value;
                        setHorariosList(newList);
                      }}
                      style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc', outline: 'none' }}
                    />
                    <button 
                      type="button" 
                      onClick={() => setHorariosList(horariosList.filter((_, idx) => idx !== i))}
                      style={{ padding: '10px 14px', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', transition: 'background 0.2s' }}
                      title="Eliminar horario"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button 
                  type="button" 
                  onClick={() => setHorariosList([...horariosList, { dia: 'Sábado', inicio: '05:00', fin: '13:00' }])}
                  style={{ marginTop: '5px', padding: '10px 15px', background: '#f8fafc', border: '1px dashed #94a3b8', color: '#475569', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', transition: 'all 0.2s' }}
                >
                  <span style={{ fontSize: '1.2rem', lineHeight: 1, color: 'var(--verde-claro)' }}>+</span> Agregar horario
                </button>
              </div>

              <div className="input-group full-width">
                <label>Métodos de cultivo</label>
                <div className="input-box">
                  <textarea
                    placeholder="Ej: Cultivo orgánico, sin pesticidas, hidropónico..."
                    value={metodosCultivo}
                    onChange={(e) => setMetodosCultivo(e.target.value)}
                  />
                </div>
              </div>

              <div className="input-group full-width">
                <label>Redes sociales</label>
                <div className="input-box">
                  <span className="input-icon">🌐</span>
                  <input
                    type="text"
                    placeholder="Ej: @mipuesto en Instagram, Facebook..."
                    value={redesSociales}
                    onChange={(e) => setRedesSociales(e.target.value)}
                  />
                </div>
              </div>

            </div>

            {/* === ACCIONES === */}
            <div className="registro-agricultor-actions">
              <button
                type="submit"
                className="save-btn"
                disabled={submitting}
                style={submitting ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
              >
                {submitting
                  ? (role === 'Agricultor' ? 'Guardando...' : 'Enviando...')
                  : role === 'Agricultor'
                    ? 'Guardar cambios'
                    : solicitudEnviada
                      ? 'Actualizar solicitud'
                      : 'Enviar solicitud de Agricultor'
                }
              </button>
              <button type="button" className="cancel-btn" onClick={() => navigate('/perfil')}>
                Volver al perfil
              </button>
              {role === 'Agricultor' && (
                <button type="button" className="cancel-btn" onClick={() => navigate('/agricultor')}>
                  Volver al Dashboard
                </button>
              )}
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RegistroAgricultor;
