import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import Navbar from '../Navbar';
import Footer from '../Footer';
import { validateEmail } from '../../utils/validation'
import { ENDPOINTS } from '../../services/api.config'
import './RegistroAgricultor.css';

// Opciones de tipo de productos
const TIPOS_PRODUCTO = [
  { value: 'Verduras', emoji: '🥬' },
  { value: 'Frutas', emoji: '🍎' },
  { value: 'Hierbas', emoji: '🌿' },
  { value: 'Tubérculos', emoji: '🥔' },
  { value: 'Proteínas', emoji: '🥩' },
];

interface FotoPreview {
  file: File;
  preview: string;
}

const RegistroAgricultor: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userId, setUserId] = useState('');

  // Estado del formulario enviado (solicitud pendiente)
  const [solicitudEnviada, setSolicitudEnviada] = useState(false);
  const [puestoId, setPuestoId] = useState('');
  const [solicitudId, setSolicitudId] = useState('');

  // Campos obligatorios
  const [nombrePuesto, setNombrePuesto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [productosAOfrecer, setProductosAOfrecer] = useState('');
  const [tiposProducto, setTiposProducto] = useState<string[]>([]);
  const [fotos, setFotos] = useState<FotoPreview[]>([]);
  const [fotosExistentes, setFotosExistentes] = useState<string[]>([]);
  const [fotosExistentesB64, setFotosExistentesB64] = useState<string[]>([]);
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');

  // Campos opcionales
  // Horarios (Múltiples opciones)
  const [horarios, setHorarios] = useState<{dia: string, ralgo: string}[]>([{dia: 'Lunes', ralgo: ''}]);
  const [metodosCultivo, setMetodosCultivo] = useState('');
  const [redesSociales, setRedesSociales] = useState('');

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      navigate('/auth');
      return;
    }

    const cachedUser = JSON.parse(userStr);

    // Solo usuarios (no agricultores ni administradores) pueden acceder a esta página
    if (cachedUser.role?.toLowerCase() !== 'usuario') {
      navigate('/perfil');
      return;
    }

    const currentUserId = cachedUser.id;
    setUserId(currentUserId);
    setEmail(cachedUser.email || '');

    // Cargar datos existentes del puesto y solicitud pendiente
    const cargarDatosExistentes = async () => {
      try {
        // 1. Buscar puesto existente (filtrado client-side por compatibilidad con json-server)
        const puestoRes = await fetch(ENDPOINTS.puestosAgricultor);
        const todosPuestos = await puestoRes.json();
        const misPuestos = todosPuestos.filter((p: { usuarioId: string | number }) => String(p.usuarioId) === String(currentUserId));

        if (misPuestos.length > 0) {
          const puesto = misPuestos[misPuestos.length - 1]; // Último puesto creado
          setPuestoId(puesto.id);
          setNombrePuesto(puesto.nombrePuesto || '');
          setDescripcion(puesto.descripcion || '');
          setUbicacion(puesto.ubicacion || '');
          setProductosAOfrecer(puesto.productosAOfrecer || '');
          setTiposProducto(puesto.tiposProducto || []);
          // Compatibilidad: campo antiguo logoNombre o nuevo fotosNombres
          const fotosGuardadas = puesto.fotosNombres || (puesto.logoNombre ? [puesto.logoNombre] : []);
          setFotosExistentes(fotosGuardadas);
          setFotosExistentesB64(puesto.fotosBase64 || []);
          setTelefono(puesto.telefono || '');
          setEmail(puesto.email || cachedUser.email || '');
          setHorarios(puesto.horariosList || [{dia: 'Lunes', ralgo: ''}]);
          setMetodosCultivo(puesto.metodosCultivo || '');
          setRedesSociales(puesto.redesSociales || '');
        }

        // 2. Buscar solicitud pendiente (siempre, aunque no haya puesto)
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
        console.error('Error al cargar datos existentes:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarDatosExistentes();
  }, [navigate]);


  const handleToggleProducto = (tipo: string) => {
    setTiposProducto(prev =>
      prev.includes(tipo) ? prev.filter(t => t !== tipo) : [...prev, tipo]
    );
  };

  const handleFotosChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const validFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
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
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            // Configuración de redimensionado EXTREMO para ajustarse al límite de 100kb del servidor
            const MAX_WIDTH = 300;
            const MAX_HEIGHT = 300;
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
              }
            } else {
              if (height > MAX_HEIGHT) {
                width *= MAX_HEIGHT / height;
                height = MAX_HEIGHT;
              }
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, width, height);
            
            // Comprimir a 10% calidad para que el Base64 sea minúsculo (< 10kb por foto)
            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.1);
            resolve({ file, preview: compressedBase64 });
          };
          img.src = e.target?.result as string;
        };
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
    setFotosExistentesB64(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones obligatorias
    if (!nombrePuesto.trim() || !descripcion.trim() || !ubicacion.trim() || !productosAOfrecer.trim() || !telefono.trim() || !email.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Por favor, completá todos los campos obligatorios.',
        confirmButtonColor: 'var(--verde-claro)',
      });
      return;
    }

    if (telefono.trim().length < 8) {
      Swal.fire({
        icon: 'warning',
        title: 'Teléfono inválido',
        text: 'El número de teléfono debe tener al menos 8 dígitos.',
        confirmButtonColor: 'var(--verde-claro)',
      });
      return;
    }

    if (tiposProducto.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Categorías faltantes',
        text: 'Seleccioná al menos una categoría de productos.',
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

    const { isConfirmed } = await Swal.fire({
      title: '¿Confirmar envío?',
      text: 'Se enviará tu información para solicitar el cambio de rol a Agricultor.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: 'var(--verde-claro)',
      cancelButtonColor: '#718096',
      confirmButtonText: 'Sí, enviar ahora',
      cancelButtonText: 'Revisar datos'
    });

    if (!isConfirmed) return;

    setSubmitting(true);

    try {
      const fotosNombres = [
        ...fotosExistentes,
        ...fotos.map(f => f.file.name)
      ];
      
      const fotosBase64Array = [
        ...fotosExistentesB64,
        ...fotos.map(f => f.preview)
      ];

      const puestoData = {
        usuarioId: userId,
        nombrePuesto: nombrePuesto.trim(),
        descripcion: descripcion.trim(),
        ubicacion: ubicacion.trim(),
        productosAOfrecer: productosAOfrecer.trim(),
        tiposProducto,
        fotosNombres,
        fotosBase64: fotosBase64Array,
        telefono: telefono.trim(),
        email: email.trim(),
        horarios: horarios.map(h => `${h.dia}: ${h.ralgo}`).join(', '), // Mantenemos compatibilidad con string
        horariosList: horarios, // Guardamos la lista estructurada
        metodosCultivo: metodosCultivo.trim(),
        redesSociales: redesSociales.trim(),
        fechaRegistro: new Date().toISOString()
      };

      let puestoSaved = false;
      if (puestoId) {
        try {
          const puestoRes = await fetch(`${ENDPOINTS.puestosAgricultor}/${puestoId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(puestoData)
          });
          
          if (puestoRes.ok) {
            puestoSaved = true;
          } else if (puestoRes.status === 404) {
            console.warn('El puesto ya no existe, intentando crear uno nuevo...');
          } else {
            const errorMsg = await puestoRes.text();
            throw new Error(`Error ${puestoRes.status}: ${errorMsg.substring(0, 100)}`);
          }
        } catch (e) {
          console.error('Error en PUT:', e);
        }
      }

      if (!puestoSaved) {
        // Crear puesto nuevo (o re-crear si el anterior dio 404)
        const puestoRes = await fetch(ENDPOINTS.puestosAgricultor, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(puestoData)
        });
        
        if (!puestoRes.ok) {
          const errorText = await puestoRes.text();
          throw new Error(`Error ${puestoRes.status} al guardar: ${errorText || 'Sin respuesta del servidor'}`);
        }
        
        const nuevoPuesto = await puestoRes.json();
        setPuestoId(nuevoPuesto.id);
      }

      // Crear o actualizar solicitud de cambio de rol
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

        if (solRes.ok) {
          const nuevaSolicitud = await solRes.json();
          setSolicitudId(nuevaSolicitud.id);
        }
      }

      setSolicitudEnviada(true);
      setFotosExistentes(fotosNombres);
      setFotosExistentesB64(fotosBase64Array);
      setFotos([]);

      Swal.fire({
        icon: 'success',
        title: solicitudId ? '¡Solicitud actualizada!' : '¡Solicitud enviada!',
        text: 'Tu solicitud para ser Agricultor ha sido enviada y será revisada por un administrador.',
        confirmButtonColor: 'var(--verde-claro)',
      });

    } catch (error: any) {
      console.error('Error completo:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: `Error: ${error.message || 'Hubo un problema al procesar tu solicitud.'} Intentá de nuevo.`,
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
            <div className="profile-avatar">🌾</div>
            <h1>Solicitud de Agricultor</h1>
            <p>Completá la información de tu puesto para solicitar el rol de Agricultor</p>
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
              <h6 className="form-section-title2">Cada espacio con un asterisco (*) es obligatorio</h6>

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

              <div className="input-group">
                <label>Ubicación *</label>
                <div className="input-box">
                  <span className="input-icon">📍</span>
                  <input
                    type="text"
                    placeholder="Ej: Feria de Heredia, puesto #12"
                    value={ubicacion}
                    onChange={(e) => setUbicacion(e.target.value)}
                  />
                </div>
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

              <div className="input-group full-width">
                <label>Productos que vendes *</label>
                <div className="input-box">
                  <textarea
                    placeholder="Ej: Fresas, lechuga, miel artesanal, repollo..."
                    value={productosAOfrecer}
                    onChange={(e) => setProductosAOfrecer(e.target.value)}
                  />
                </div>
              </div>

              {/* === CATEGORÍAS === */}
              <div className="input-group full-width">
                <label>Categorías *</label>
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
                      {tipo.emoji} {tipo.value}
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
                    onChange={(e) => setTelefono(e.target.value.replace(/[^0-9]/g, ''))}
                    maxLength={15}
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
                <label>Horarios de atención * (Podés añadir varios)</label>
                <div className="horarios-config-container">
                  {horarios.map((h, idx) => (
                    <div key={idx} className="horario-row animate-fade" style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center' }}>
                      <select 
                        className="form-control" 
                        value={h.dia} 
                        onChange={(e) => {
                          const newH = [...horarios];
                          newH[idx].dia = e.target.value;
                          setHorarios(newH);
                        }}
                        style={{ flex: 1, padding: '0.8rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}
                      >
                        {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo', 'L-V', 'S-D', 'Todos los días'].map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                      <input 
                        type="text" 
                        placeholder="Ej: 7:00 AM - 3:00 PM"
                        value={h.ralgo}
                        onChange={(e) => {
                          const newH = [...horarios];
                          newH[idx].ralgo = e.target.value;
                          setHorarios(newH);
                        }}
                        style={{ flex: 2, padding: '0.8rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}
                      />
                      {horarios.length > 1 && (
                        <button 
                          type="button" 
                          onClick={() => setHorarios(horarios.filter((_, i) => i !== idx))}
                          style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer' }}
                        >✕</button>
                      )}
                    </div>
                  ))}
                  <button 
                    type="button" 
                    className="btn-add-horario"
                    onClick={() => setHorarios([...horarios, { dia: 'Sábado', ralgo: '' }])}
                    style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, marginTop: '5px' }}
                  >
                    + Añadir otro horario
                  </button>
                </div>
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
                  ? 'Enviando...'
                  : solicitudEnviada
                    ? 'Actualizar solicitud'
                    : 'Enviar solicitud de Agricultor'
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

export default RegistroAgricultor;
