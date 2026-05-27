import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import './RegistroProductor.css';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import { ENDPOINTS, authFetch } from '../../services/api.config';
import { validateEmail } from '../../utils/validation';
import CategoryIcon from '../CategoryIcon/CategoryIcon';
import { useFerias } from '../../hooks/useFerias';
import DocUploadField from './DocUploadField';
import CustomDatePicker from '../CustomDatePicker/CustomDatePicker';
import {
  TIPOS_PRODUCTO,
  PROVINCIAS_CR,
  REGIMENES_TRIBUTARIOS,
  GENEROS,
  DOC_KEYS,
  type DocKey,
  type DocPreview,
  type DatosExtendidos,
  emptyDatosExtendidos,
  calcularEdad,
  hydrateDatosExtendidos,
  buildDocumentosPayload,
  validateRegistroProductor,
  requiereSanitarioExtra,
} from './registroProductorExtend';

interface FotoPreview {
  file: File;
  preview: string;
}

interface HorarioItem {
  dia: string;
  inicio: string;
  fin: string;
}

const compressImage = (
  file: File,
  maxWidth: number = 800,
  maxHeight: number = 800,
  quality: number = 0.75
): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });

const RegistroProductor: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userId, setUserId] = useState('');
  const [role, setRole] = useState('');
  const isReset = new URLSearchParams(location.search).get('reset') === 'true';

  const [solicitudEnviada, setSolicitudEnviada] = useState(false);
  const [puestoId, setPuestoId] = useState('');
  const [solicitudId, setSolicitudId] = useState('');

  const [nombrePuesto, setNombrePuesto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [selectedFeriaId, setSelectedFeriaId] = useState('');
  const [ferias, setFerias] = useState<any[]>([]);
  const [tiposProducto, setTiposProducto] = useState<string[]>([]);
  const [fotos, setFotos] = useState<FotoPreview[]>([]);
  const [fotosExistentes, setFotosExistentes] = useState<string[]>([]);
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [horariosList, setHorariosList] = useState<HorarioItem[]>([]);
  const [metodosCultivo, setMetodosCultivo] = useState('');
  const [redesSociales, setRedesSociales] = useState('');
  const [feriaExpanded, setFeriaExpanded] = useState(false);

  const [datosExtendidos, setDatosExtendidos] = useState<DatosExtendidos>(emptyDatosExtendidos);
  const [docUploads, setDocUploads] = useState<Partial<Record<DocKey, DocPreview | null>>>({});
  const [docExistentes, setDocExistentes] = useState<Partial<Record<DocKey, string>>>({});

  const { allFerias, loading: loadingFerias } = useFerias();

  const edad = useMemo(
    () => calcularEdad(datosExtendidos.personal.fechaNacimiento),
    [datosExtendidos.personal.fechaNacimiento]
  );

  const mostrarSanitarioExtra = useMemo(
    () => requiereSanitarioExtra(tiposProducto),
    [tiposProducto]
  );

  const patchSection = <K extends keyof DatosExtendidos>(
    section: K,
    patch: Partial<DatosExtendidos[K]>
  ) => {
    setDatosExtendidos((prev) => ({
      ...prev,
      [section]: { ...(prev[section] as object), ...patch } as DatosExtendidos[K],
    }));
  };

  useEffect(() => {
    if (allFerias?.length) {
      setFerias(
        allFerias.map((f: any) => ({
          ...f,
          name: f.nombre,
          location: f.direccion,
          province: f.provincia,
        }))
      );
    }
  }, [allFerias]);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      navigate('/auth');
      return;
    }
    const cachedUser = JSON.parse(userStr);
    if (
      cachedUser.role !== 'Cliente' &&
      cachedUser.role !== 'Usuario' &&
      cachedUser.role !== 'Productor'
    ) {
      navigate('/perfil');
      return;
    }

    setRole(cachedUser.role);
    const currentUserId = cachedUser.id;
    setUserId(currentUserId);
    setEmail(cachedUser.email || '');
    setNombreUsuario(cachedUser.name || cachedUser.nombre || '');

    const cargarDatos = async () => {
      try {
        setLoading(true);
        if (isReset) return;

        const puestoRes = await authFetch(ENDPOINTS.puestosProductor);
        const jsonPuestos = await puestoRes.json();
        const todosPuestos = jsonPuestos.success ? jsonPuestos.data : jsonPuestos;
        const misPuestos = (todosPuestos || []).filter(
          (p: any) => String(p.usuarioId || p.usuario_id) === String(currentUserId)
        );

        if (misPuestos.length > 0) {
          const puesto = misPuestos[misPuestos.length - 1];
          setPuestoId(puesto.id);
          setNombrePuesto(puesto.nombrePuesto || puesto.nombre_puesto || '');
          setDescripcion(puesto.descripcion || '');
          setSelectedFeriaId(String(puesto.feriaId || puesto.feria_id || ''));
          setTiposProducto(puesto.tiposProducto || puesto.tipos_producto || []);
          const fotosN = puesto.fotosNombres || puesto.fotos_nombres || [];
          const logoN = puesto.logoNombre || puesto.logo_nombre;
          setFotosExistentes(fotosN.length > 0 ? fotosN : logoN ? [logoN] : []);
          setTelefono(puesto.telefono || '');
          setEmail(puesto.email || cachedUser.email || '');
          const hList = puesto.horariosList || puesto.horarios_list;
          if (Array.isArray(hList)) setHorariosList(hList);
          setMetodosCultivo(puesto.metodosCultivo || puesto.metodos_cultivo || '');
          setRedesSociales(puesto.redesSociales || puesto.redes_sociales || '');

          const ext = hydrateDatosExtendidos(puesto.datosExtendidos || puesto.datos_extendidos);
          setDatosExtendidos(ext);
          const nombres = ext.documentosNombres || {};
          const existentes: Partial<Record<DocKey, string>> = {};
          DOC_KEYS.forEach((k) => {
            if (nombres[k]) existentes[k] = nombres[k];
          });
          setDocExistentes(existentes);
        }

        const solRes = await authFetch(ENDPOINTS.solicitudesCambioRol);
        const jsonSols = await solRes.json();
        const todasSolicitudes = jsonSols.success ? jsonSols.data : jsonSols;
        const misSolicitudes = (todasSolicitudes || []).filter(
          (s: any) =>
            String(s.usuarioId || s.usuario_id) === String(currentUserId) &&
            (s.rolSolicitado || s.rol_solicitado || 'Productor') === 'Productor' &&
            s.estado === 'Pendiente'
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
  }, [navigate, isReset]);

  const handleToggleProducto = (tipo: string) => {
    setTiposProducto((prev) =>
      prev.includes(tipo) ? prev.filter((t) => t !== tipo) : [...prev, tipo]
    );
  };

  const handleFotosChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
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
    const nuevasFotos = await Promise.all(
      archivosValidos.slice(0, disponibles).map(async (file) => {
        try {
          return { file, preview: await compressImage(file) };
        } catch {
          return new Promise<FotoPreview>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve({ file, preview: reader.result as string });
            reader.readAsDataURL(file);
          });
        }
      })
    );
    setFotos((prev) => [...prev, ...nuevasFotos]);
    e.target.value = '';
  };

  const handleDocChange = (key: DocKey, data: DocPreview | null) => {
    setDocUploads((prev) => ({ ...prev, [key]: data }));
    if (data) {
      setDocExistentes((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const faltantes = validateRegistroProductor({
      nombrePuesto,
      selectedFeriaId,
      descripcion,
      tiposProducto,
      fotosCount: fotos.length + fotosExistentes.length,
      telefono,
      email,
      datos: datosExtendidos,
      tiposSanitarioExtra: mostrarSanitarioExtra,
    });

    if (faltantes.length > 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos obligatorios incompletos',
        text: `Completá: ${faltantes.join(', ')}.`,
        confirmButtonColor: 'var(--verde-claro)',
      });
      return;
    }

    if (telefono.trim().length !== 8) {
      Swal.fire({
        icon: 'warning',
        title: 'Teléfono inválido',
        text: 'El teléfono debe tener exactamente 8 dígitos.',
        confirmButtonColor: 'var(--verde-claro)',
      });
      return;
    }

    const telSec = datosExtendidos.personal.telefonoSecundario.trim();
    if (telSec && telSec.length !== 8) {
      Swal.fire({
        icon: 'warning',
        title: 'Teléfono secundario inválido',
        text: 'Debe tener 8 dígitos o dejarse vacío.',
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
      const feriaSeleccionada = ferias.find((f) => String(f.id) === String(selectedFeriaId));
      const ubicacionNombre = feriaSeleccionada ? feriaSeleccionada.name : '';
      const fotosNombres = [...fotosExistentes, ...fotos.map((f) => f.file.name)];
      const fotosBase64 = fotos.map((f) => f.preview);
      const { documentos, documentosNombres } = buildDocumentosPayload(
        docUploads,
        docExistentes,
        datosExtendidos
      );

      const puestoData = {
        usuario_id: userId,
        nombre_puesto: nombrePuesto.trim(),
        descripcion: descripcion.trim(),
        ubicacion: [ubicacionNombre],
        feria_id: selectedFeriaId,
        tipos_producto: tiposProducto,
        fotos_nombres: fotosNombres,
        fotos_base64: fotosBase64,
        telefono: telefono.trim(),
        email: email.trim(),
        horarios:
          horariosList.length > 0
            ? horariosList.map((h) => `${h.dia} de ${h.inicio} a ${h.fin}`).join(', ')
            : '',
        horarios_list: horariosList,
        metodos_cultivo: metodosCultivo.trim(),
        redes_sociales: redesSociales.trim(),
        fecha_registro: new Date().toISOString(),
        datos_extendidos: {
          ...datosExtendidos,
          documentos,
          documentosNombres,
        },
      };

      if (puestoId) {
        const puestoRes = await authFetch(`${ENDPOINTS.puestosProductor}/${puestoId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(puestoData),
        });
        if (!puestoRes.ok) {
          const errData = await puestoRes.json();
          throw new Error(errData.message || 'Error al actualizar puesto');
        }
      } else {
        const puestoRes = await authFetch(ENDPOINTS.puestosProductor, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(puestoData),
        });
        if (!puestoRes.ok) {
          const errData = await puestoRes.json();
          throw new Error(errData.message || 'Error al guardar puesto');
        }
        const nuevoPuesto = await puestoRes.json();
        const realPuesto = nuevoPuesto.success ? nuevoPuesto.data : nuevoPuesto;
        setPuestoId(realPuesto.id);
      }

      if (role === 'Productor') {
        Swal.fire({
          icon: 'success',
          title: '¡Información actualizada!',
          text: 'Los datos de tu puesto han sido actualizados correctamente.',
          confirmButtonColor: 'var(--verde-claro)',
        }).then(() => navigate('/productor'));
        return;
      }

      if (!solicitudId) {
        const solicitudData = {
          usuarioId: userId,
          nombreUsuario: nombreUsuario,
          nombreDelPuesto: nombrePuesto.trim(),
          correoUsuario: email.trim(),
          rolSolicitado: 'Productor',
          estado: 'Pendiente',
          motivo_respuesta: '',
          fecha_solicitud: new Date().toISOString(),
        };
        const solRes = await authFetch(ENDPOINTS.solicitudesCambioRol, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(solicitudData),
        });
        if (!solRes.ok) {
          const errData = await solRes.json();
          throw new Error(errData.message || 'Error al crear solicitud');
        }
        const nuevaSolicitud = await solRes.json();
        const realSolicitud = nuevaSolicitud.success ? nuevaSolicitud.data : nuevaSolicitud;
        setSolicitudId(realSolicitud.id);
      } else {
        const solRes = await authFetch(`${ENDPOINTS.solicitudesCambioRol}/${solicitudId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nombreUsuario: nombreUsuario,
            nombreDelPuesto: nombrePuesto.trim(),
            correoUsuario: email.trim(),
            estado: 'Pendiente',
            fecha_solicitud: new Date().toISOString(),
          }),
        });
        if (!solRes.ok) {
          const errData = await solRes.json();
          throw new Error(errData.message || 'Error al actualizar solicitud');
        }
      }

      setSolicitudEnviada(true);
      setFotosExistentes(fotosNombres);
      setFotos([]);

      Swal.fire({
        icon: 'success',
        title: solicitudId ? '¡Solicitud actualizada!' : '¡Solicitud enviada!',
        text: 'Tu solicitud para ser Productor ha sido enviada y será revisada por un administrador.',
        confirmButtonColor: 'var(--verde-claro)',
      }).then(() => navigate('/perfil'));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: message || 'Hubo un problema al procesar tu solicitud.',
        confirmButtonColor: 'var(--verde-claro)',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const p = datosExtendidos.personal;
  const prod = datosExtendidos.produccion;
  const mag = datosExtendidos.mag;
  const san = datosExtendidos.sanitario;
  const trib = datosExtendidos.tributario;
  const sf = datosExtendidos.solicitudFeria;
  const cal = datosExtendidos.calidad;

  if (loading || loadingFerias) {
    return (
      <div className="profile-page-loading">
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <div className="registro-productor-page">
      <Navbar />
      <main className="registro-productor-container">
        <div className="registro-productor-card animate-fade">
          <div className="profile-header">
            <div className="header-info">
              <h1>{role === 'Productor' ? 'Gestionar Información' : 'Registro de Productor'}</h1>
              <p>
                {role === 'Productor'
                  ? 'Mantené actualizados los datos de tu puesto y feria.'
                  : 'Completá los datos para que un administrador revise tu solicitud.'}
              </p>
            </div>
          </div>

          {solicitudEnviada && (
            <div className="solicitud-status-banner pending">
              <span className="status-icon">⏳</span>
              <div>
                <strong>Solicitud pendiente de aprobación</strong>
                <p>Tu solicitud está siendo revisada. Podés editar la información mientras tanto.</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="registro-productor-form">
            <div className="registro-productor-grid">

              <div className="form-section-card">
                <h3 className="form-section-title">Información personal del productor</h3>
                <div className="input-group">
                  <label>Nombre *</label>
                  <div className="input-box">
                    <input value={p.nombre} onChange={(e) => patchSection('personal', { nombre: e.target.value })} placeholder="Nombre" />
                  </div>
                </div>
                <div className="input-group">
                  <label>Primer apellido *</label>
                  <div className="input-box">
                    <input value={p.primerApellido} onChange={(e) => patchSection('personal', { primerApellido: e.target.value })} />
                  </div>
                </div>
                <div className="input-group">
                  <label>Segundo apellido</label>
                  <div className="input-box">
                    <input value={p.segundoApellido} onChange={(e) => patchSection('personal', { segundoApellido: e.target.value })} />
                  </div>
                </div>
                <div className="input-group">
                  <label>Cédula *</label>
                  <div className="input-box">
                    <input value={p.cedula} onChange={(e) => patchSection('personal', { cedula: e.target.value.replace(/[^0-9]/g, '').slice(0, 12) })} maxLength={12} />
                  </div>
                </div>
                <div className="input-group">
                  <label>Fecha de nacimiento *</label>
                  <CustomDatePicker
                    value={p.fechaNacimiento}
                    onChange={(val) => patchSection('personal', { fechaNacimiento: val })}
                    minYear={new Date().getFullYear() - 100}
                    maxYear={new Date().getFullYear()}
                  />
                  {edad !== null && <p className="edad-display">Edad: {edad} años</p>}
                </div>
                <div className="input-group">
                  <label>Género</label>
                  <div className="input-box">
                    <select value={p.genero} onChange={(e) => patchSection('personal', { genero: e.target.value })}>
                      <option value="">Seleccionar</option>
                      {GENEROS.map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="input-group">
                  <label>Nacionalidad</label>
                  <div className="input-box">
                    <input value={p.nacionalidad} onChange={(e) => patchSection('personal', { nacionalidad: e.target.value })} />
                  </div>
                </div>
                <div className="input-group">
                  <label>Provincia *</label>
                  <div className="input-box">
                    <select value={p.provincia} onChange={(e) => patchSection('personal', { provincia: e.target.value })}>
                      <option value="">Seleccionar</option>
                      {PROVINCIAS_CR.map((pr) => (
                        <option key={pr} value={pr}>{pr}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="input-group">
                  <label>Cantón</label>
                  <div className="input-box">
                    <input value={p.canton} onChange={(e) => patchSection('personal', { canton: e.target.value })} />
                  </div>
                </div>
                <div className="input-group">
                  <label>Distrito</label>
                  <div className="input-box">
                    <input value={p.distrito} onChange={(e) => patchSection('personal', { distrito: e.target.value })} />
                  </div>
                </div>
              </div>

              <h3 className="form-section-title">Información del puesto</h3>
              <div className="input-group">
                <label>Nombre del puesto *</label>
                <div className="input-box">
                  <span className="input-icon">🏪</span>
                  <input value={nombrePuesto} onChange={(e) => setNombrePuesto(e.target.value)} placeholder="Ej: Puesto Don Carlos" />
                </div>
              </div>

              <div className="input-group full-width" style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1rem', background: '#f8fafc' }}>
                <button type="button" onClick={() => setFeriaExpanded(!feriaExpanded)} className="section-toggle-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'var(--verde-oscuro)', fontWeight: 600 }}>
                  <label style={{ cursor: 'pointer', margin: 0 }}>
                    📍 Feria en la cual desea vender *
                    {selectedFeriaId && (
                      <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 400, marginLeft: 10 }}>
                        ({ferias.find((f) => String(f.id) === String(selectedFeriaId))?.name})
                      </span>
                    )}
                  </label>
                  <span style={{ transform: feriaExpanded ? 'rotate(180deg)' : 'rotate(0)' }}>▼</span>
                </button>
                {feriaExpanded && (
                  <div className="productos-grid animate-fade" style={{ marginTop: '1.5rem' }}>
                    {ferias.map((f) => (
                      <label key={f.id} className={`producto-chip ${String(selectedFeriaId) === String(f.id) ? 'selected' : ''}`}>
                        <input type="radio" name="feria-selection" checked={String(selectedFeriaId) === String(f.id)} onChange={() => setSelectedFeriaId(String(f.id))} />
                        <span className="chip-check radio"><div className="radio-inner" /></span>
                        <span className="chip-icon">📍</span>
                        <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                          <span style={{ fontWeight: 600 }}>{f.name}</span>
                          <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>{f.location}, {f.province}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div className="input-group full-width">
                <label>Descripción *</label>
                <div className="input-box">
                  <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Describí tu puesto..." />
                </div>
              </div>

              <div className="form-section-card">
                <h3 className="form-section-title">Información de producción</h3>
                <div className="input-group">
                  <label>Nombre de la finca</label>
                  <div className="input-box"><input value={prod.nombreFinca} onChange={(e) => patchSection('produccion', { nombreFinca: e.target.value })} /></div>
                </div>
                <div className="input-group">
                  <label>Tamaño de la finca</label>
                  <div className="input-box"><input value={prod.tamanoFinca} onChange={(e) => patchSection('produccion', { tamanoFinca: e.target.value })} placeholder="Ej: 2 hectáreas" /></div>
                </div>
                <div className="input-group full-width">
                  <label>Dirección de la finca</label>
                  <div className="input-box"><input value={prod.direccionFinca} onChange={(e) => patchSection('produccion', { direccionFinca: e.target.value })} /></div>
                </div>
                <div className="input-group">
                  <label>Temporadas de cosecha</label>
                  <div className="input-box"><input value={prod.temporadasCosecha} onChange={(e) => patchSection('produccion', { temporadasCosecha: e.target.value })} /></div>
                </div>
                <div className="input-group">
                  <label>Producción mensual estimada</label>
                  <div className="input-box"><input value={prod.produccionMensual} onChange={(e) => patchSection('produccion', { produccionMensual: e.target.value })} /></div>
                </div>
                <label className="checkbox-row full-width">
                  <input type="checkbox" checked={prod.produccionOrganica} onChange={(e) => patchSection('produccion', { produccionOrganica: e.target.checked })} />
                  Producción orgánica
                </label>
                <div className="input-group full-width">
                  <label>Descripción agrícola</label>
                  <div className="input-box"><textarea value={prod.descripcionAgricola} onChange={(e) => patchSection('produccion', { descripcionAgricola: e.target.value })} /></div>
                </div>
              </div>

              <div className="input-group full-width">
                <label>Tipo de productos que ofrecés *</label>
                <div className="productos-grid">
                  {TIPOS_PRODUCTO.map((tipo) => (
                    <label key={tipo} className={`producto-chip ${tiposProducto.includes(tipo) ? 'selected' : ''}`}>
                      <input type="checkbox" checked={tiposProducto.includes(tipo)} onChange={() => handleToggleProducto(tipo)} />
                      <span className="chip-check">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                      </span>
                      <span className="chip-icon"><CategoryIcon categoria={tipo} size={18} /></span>
                      <span>{tipo}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-section-card">
                <h3 className="form-section-title">Registro MAG / Feriante</h3>
                <div className="input-group"><label>N.º registro MAG</label><div className="input-box"><input value={mag.numeroRegistroMag} onChange={(e) => patchSection('mag', { numeroRegistroMag: e.target.value })} /></div></div>
                <div className="input-group"><label>Carnet feriante</label><div className="input-box"><input value={mag.carnetFeriante} onChange={(e) => patchSection('mag', { carnetFeriante: e.target.value })} /></div></div>
                <div className="input-group">
                  <label>Fecha emisión MAG</label>
                  <CustomDatePicker
                    value={mag.fechaEmisionMag}
                    onChange={(val) => patchSection('mag', { fechaEmisionMag: val })}
                    minYear={new Date().getFullYear() - 15}
                    maxYear={new Date().getFullYear() + 20}
                  />
                </div>
                <div className="input-group">
                  <label>Fecha vencimiento MAG</label>
                  <CustomDatePicker
                    value={mag.fechaVencimientoMag}
                    onChange={(val) => patchSection('mag', { fechaVencimientoMag: val })}
                    minYear={new Date().getFullYear() - 15}
                    maxYear={new Date().getFullYear() + 20}
                  />
                </div>
                <div className="input-group full-width"><label>Comité de feria asociada</label><div className="input-box"><input value={mag.comiteFeriaAsociada} onChange={(e) => patchSection('mag', { comiteFeriaAsociada: e.target.value })} /></div></div>
                <div className="doc-upload-grid full-width">
                  <DocUploadField docKey="foto_carnet_mag" label="Foto carnet MAG" fileData={docUploads.foto_carnet_mag || null} existingName={docExistentes.foto_carnet_mag} onChange={handleDocChange} onRemoveExisting={(k) => setDocExistentes((prev) => { const n = { ...prev }; delete n[k]; return n; })} compress={compressImage} />
                  <DocUploadField docKey="dictamen_tecnico" label="Dictamen técnico" fileData={docUploads.dictamen_tecnico || null} existingName={docExistentes.dictamen_tecnico} onChange={handleDocChange} onRemoveExisting={(k) => setDocExistentes((prev) => { const n = { ...prev }; delete n[k]; return n; })} compress={compressImage} />
                  <DocUploadField docKey="certificacion_productor" label="Certificación productor" fileData={docUploads.certificacion_productor || null} existingName={docExistentes.certificacion_productor} onChange={handleDocChange} onRemoveExisting={(k) => setDocExistentes((prev) => { const n = { ...prev }; delete n[k]; return n; })} compress={compressImage} />
                </div>
              </div>

              <div className="form-section-card">
                <h3 className="form-section-title">Requisitos sanitarios</h3>
                <label className="checkbox-row full-width">
                  <input type="checkbox" checked={san.tieneManipulacionAlimentos} onChange={(e) => patchSection('sanitario', { tieneManipulacionAlimentos: e.target.checked })} />
                  Tengo carné de manipulación de alimentos
                </label>
                {san.tieneManipulacionAlimentos && (
                  <>
                    <div className="input-group"><label>N.º carné manipulación</label><div className="input-box"><input value={san.numeroCarnetManipulacion} onChange={(e) => patchSection('sanitario', { numeroCarnetManipulacion: e.target.value })} /></div></div>
                    <div className="input-group">
                      <label>Fecha emisión</label>
                      <CustomDatePicker
                        value={san.fechaEmisionManipulacion}
                        onChange={(val) => patchSection('sanitario', { fechaEmisionManipulacion: val })}
                        minYear={new Date().getFullYear() - 15}
                        maxYear={new Date().getFullYear() + 20}
                      />
                    </div>
                    <div className="input-group">
                      <label>Fecha vencimiento</label>
                      <CustomDatePicker
                        value={san.fechaVencimientoManipulacion}
                        onChange={(val) => patchSection('sanitario', { fechaVencimientoManipulacion: val })}
                        minYear={new Date().getFullYear() - 15}
                        maxYear={new Date().getFullYear() + 20}
                      />
                    </div>
                    <div className="input-group full-width"><label>Institución emisora</label><div className="input-box"><input value={san.institucionEmisora} onChange={(e) => patchSection('sanitario', { institucionEmisora: e.target.value })} /></div></div>
                    <DocUploadField docKey="carnet_manipulacion" label="Carné manipulación" fileData={docUploads.carnet_manipulacion || null} existingName={docExistentes.carnet_manipulacion} onChange={handleDocChange} onRemoveExisting={(k) => setDocExistentes((prev) => { const n = { ...prev }; delete n[k]; return n; })} compress={compressImage} />
                  </>
                )}
                {mostrarSanitarioExtra && (
                  <>
                    <div className="input-group full-width"><label>Permiso Ministerio de Salud</label><div className="input-box"><input value={san.permisoMinisterioSalud} onChange={(e) => patchSection('sanitario', { permisoMinisterioSalud: e.target.value })} /></div></div>
                    <div className="input-group full-width"><label>Registro SENASA</label><div className="input-box"><input value={san.registroSenasa} onChange={(e) => patchSection('sanitario', { registroSenasa: e.target.value })} /></div></div>
                    <label className="checkbox-row full-width">
                      <input type="checkbox" checked={san.tieneRefrigeracion} onChange={(e) => patchSection('sanitario', { tieneRefrigeracion: e.target.checked })} />
                      Cuenta con refrigeración
                    </label>
                    {san.tieneRefrigeracion && (
                      <div className="input-group full-width"><label>Tipo de refrigeración</label><div className="input-box"><input value={san.tipoRefrigeracion} onChange={(e) => patchSection('sanitario', { tipoRefrigeracion: e.target.value })} /></div></div>
                    )}
                  </>
                )}
              </div>

              <div className="form-section-card">
                <h3 className="form-section-title">Información tributaria</h3>
                <div className="input-group"><label>N.º tributario</label><div className="input-box"><input value={trib.numeroTributario} onChange={(e) => patchSection('tributario', { numeroTributario: e.target.value })} /></div></div>
                <div className="input-group">
                  <label>Régimen tributario</label>
                  <div className="input-box">
                    <select value={trib.regimenTributario} onChange={(e) => patchSection('tributario', { regimenTributario: e.target.value })}>
                      <option value="">Seleccionar</option>
                      {REGIMENES_TRIBUTARIOS.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                </div>
                <DocUploadField docKey="constancia_tributaria" label="Constancia tributaria" fileData={docUploads.constancia_tributaria || null} existingName={docExistentes.constancia_tributaria} onChange={handleDocChange} onRemoveExisting={(k) => setDocExistentes((prev) => { const n = { ...prev }; delete n[k]; return n; })} compress={compressImage} />
              </div>

              <div className="form-section-card">
                <h3 className="form-section-title">Solicitud de feria</h3>
                <div className="input-group full-width"><label>Comité administrador</label><div className="input-box"><input value={sf.comiteAdministrador} onChange={(e) => patchSection('solicitudFeria', { comiteAdministrador: e.target.value })} /></div></div>
                <div className="input-group"><label>Tipo de puesto</label><div className="input-box"><input value={sf.tipoPuesto} onChange={(e) => patchSection('solicitudFeria', { tipoPuesto: e.target.value })} /></div></div>
                <div className="input-group"><label>Dimensiones del puesto</label><div className="input-box"><input value={sf.dimensionesPuesto} onChange={(e) => patchSection('solicitudFeria', { dimensionesPuesto: e.target.value })} placeholder="Ej: 3m x 2m" /></div></div>
                <label className="checkbox-row"><input type="checkbox" checked={sf.requiereElectricidad} onChange={(e) => patchSection('solicitudFeria', { requiereElectricidad: e.target.checked })} /> Requiere electricidad</label>
                <label className="checkbox-row"><input type="checkbox" checked={sf.requiereAgua} onChange={(e) => patchSection('solicitudFeria', { requiereAgua: e.target.checked })} /> Requiere agua</label>
                <label className="checkbox-row full-width">
                  <input type="checkbox" checked={sf.aceptaReglamento} onChange={(e) => patchSection('solicitudFeria', { aceptaReglamento: e.target.checked })} />
                  Acepto el reglamento de la feria *
                </label>
                <label className="checkbox-row full-width">
                  <input type="checkbox" checked={sf.aceptaDerechoPiso} onChange={(e) => patchSection('solicitudFeria', { aceptaDerechoPiso: e.target.checked })} />
                  Acepto el derecho de piso *
                </label>
              </div>

              <div className="form-section-card">
                <h3 className="form-section-title">Calidad del producto</h3>
                {([
                  ['productoFresco', 'Producto fresco'],
                  ['productoLimpio', 'Producto limpio'],
                  ['librePlagas', 'Libre de plagas'],
                  ['empaqueAdecuado', 'Empaque adecuado'],
                  ['etiquetadoCorrecto', 'Etiquetado correcto'],
                ] as const).map(([key, label]) => (
                  <label key={key} className="checkbox-row full-width">
                    <input type="checkbox" checked={cal[key]} onChange={(e) => patchSection('calidad', { [key]: e.target.checked })} />
                    {label}
                  </label>
                ))}
                <DocUploadField docKey="certificacion_romana" label="Certificación romana" fileData={docUploads.certificacion_romana || null} existingName={docExistentes.certificacion_romana} onChange={handleDocChange} onRemoveExisting={(k) => setDocExistentes((prev) => { const n = { ...prev }; delete n[k]; return n; })} compress={compressImage} />
              </div>

              <div className="input-group full-width">
                <label>Fotos del puesto y productos * (JPG, PNG o WebP · Máx 6)</label>
                {fotosExistentes.length > 0 && (
                  <div className="fotos-preview-grid">
                    {fotosExistentes.map((nombre, i) => (
                      <div key={`ex-${i}`} className="foto-preview-item">
                        <div className="foto-name">📄 {nombre}</div>
                        <button type="button" className="logo-remove-btn" onClick={() => setFotosExistentes((prev) => prev.filter((_, idx) => idx !== i))}>✕</button>
                      </div>
                    ))}
                  </div>
                )}
                {fotos.length > 0 && (
                  <div className="fotos-preview-grid">
                    {fotos.map((foto, i) => (
                      <div key={`n-${i}`} className="foto-preview-item">
                        <img src={foto.preview} alt={`Foto ${i + 1}`} />
                        <span>{foto.file.name}</span>
                        <button type="button" className="logo-remove-btn" onClick={() => setFotos((prev) => prev.filter((_, idx) => idx !== i))}>✕</button>
                      </div>
                    ))}
                  </div>
                )}
                {fotos.length + fotosExistentes.length < 6 && (
                  <label className="logo-upload-area">
                    <input type="file" accept=".jpg,.jpeg,.png,.webp" multiple onChange={handleFotosChange} style={{ display: 'none' }} />
                    <div className="logo-upload-icon">📷</div>
                    <div className="logo-upload-text"><strong>Hacé clic</strong> para seleccionar imágenes</div>
                    <div className="logo-upload-formats">JPG, PNG o WebP · {6 - fotos.length - fotosExistentes.length} restante(s)</div>
                  </label>
                )}
              </div>

              <h3 className="form-section-title">Contacto</h3>
              <div className="input-group">
                <label>Teléfono *</label>
                <div className="input-box">
                  <span className="input-icon">📞</span>
                  <input type="tel" value={telefono} onChange={(e) => setTelefono(e.target.value.replace(/[^0-9]/g, '').slice(0, 8))} maxLength={8} />
                </div>
              </div>
              <div className="input-group">
                <label>Correo electrónico *</label>
                <div className="input-box">
                  <span className="input-icon">✉️</span>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
              </div>

              <h3 className="form-section-title">Información adicional (opcional)</h3>
              <div className="input-group full-width">
                <label>Horarios de atención</label>
                {horariosList.map((h, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                    <select value={h.dia} onChange={(e) => { const n = [...horariosList]; n[i].dia = e.target.value; setHorariosList(n); }} style={{ flex: 1, minWidth: 120, padding: 10, borderRadius: 8, border: '1px solid #ccc' }}>
                      {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <input type="time" value={h.inicio} onChange={(e) => { const n = [...horariosList]; n[i].inicio = e.target.value; setHorariosList(n); }} style={{ padding: 10, borderRadius: 8, border: '1px solid #ccc' }} />
                    <input type="time" value={h.fin} onChange={(e) => { const n = [...horariosList]; n[i].fin = e.target.value; setHorariosList(n); }} style={{ padding: 10, borderRadius: 8, border: '1px solid #ccc' }} />
                    <button type="button" onClick={() => setHorariosList(horariosList.filter((_, idx) => idx !== i))} style={{ padding: '10px 14px', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: 8, cursor: 'pointer' }}>✕</button>
                  </div>
                ))}
                <button type="button" onClick={() => setHorariosList([...horariosList, { dia: 'Sábado', inicio: '05:00', fin: '13:00' }])} style={{ marginTop: 5, padding: '10px 15px', background: '#f8fafc', border: '1px dashed #94a3b8', borderRadius: 8, cursor: 'pointer' }}>+ Agregar horario</button>
              </div>
              <div className="input-group full-width">
                <label>Métodos de cultivo</label>
                <div className="input-box"><textarea value={metodosCultivo} onChange={(e) => setMetodosCultivo(e.target.value)} /></div>
              </div>
              <div className="input-group full-width">
                <label>Redes sociales</label>
                <div className="input-box">
                  <span className="input-icon">🌐</span>
                  <input value={redesSociales} onChange={(e) => setRedesSociales(e.target.value)} placeholder="@mipuesto" />
                </div>
              </div>
            </div>

            <div className="registro-productor-actions">
              <button type="submit" className="save-btn" disabled={submitting} style={submitting ? { opacity: 0.6, cursor: 'not-allowed' } : {}}>
                {submitting ? (role === 'Productor' ? 'Guardando...' : 'Enviando...') : role === 'Productor' ? 'Guardar cambios' : solicitudEnviada ? 'Actualizar solicitud' : 'Enviar solicitud de Productor'}
              </button>
              <button type="button" className="cancel-btn" onClick={() => navigate('/perfil')}>Volver al perfil</button>
              {role === 'Productor' && (
                <button type="button" className="cancel-btn" onClick={() => navigate('/productor')}>Volver al Dashboard</button>
              )}
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RegistroProductor;
