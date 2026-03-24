import React, { useState, useEffect } from 'react'
import Swal from 'sweetalert2'
import { useAuth } from '../../context/AuthContext'
import Navbar from '../../Navbar/Navbar'
import AdminSidebar from '../../adminAgricultor/AgricultorSidebar'
import AdminHeader from '../../adminAgricultor/AgricultorHeader'
<<<<<<< HEAD
import { Producto } from '../../../servers/ProductService'
=======
>>>>>>> 4325f1856665e17db6cd392cc18ba9518db22206
import { getFeriaById, getProductos, getPuestoByUserId, updatePuesto } from '../../../servers/AgricultorServices'
import './MisFerias.css'

interface Feria {
  id: number
  nombre: string
  ubicacion: string
  provincia: string
  horario: string
  emoji: string
  productCount: number
}

interface Puesto {
  id: string | number
  nombrePuesto: string
  descripcion: string
  ubicacion: string
  telefono: string
  email: string
  horarios?: string
  metodosCultivo?: string
  redesSociales?: string
  tiposProducto?: string[]
  fotosNombres?: string[]
  fotosBase64?: string[]
}

interface FotoPreview {
  file: File;
  preview: string;
}

const MisFerias: React.FC = () => {
  const { user } = useAuth()
  const [feria, setFeria] = useState<Feria | null>(null)
  const [puesto, setPuesto] = useState<Puesto | null>(null)
<<<<<<< HEAD
  const [productosFeria, setProductosFeria] = useState<Producto[]>([])
=======
  const [productosFeria, setProductosFeria] = useState<any[]>([])
>>>>>>> 4325f1856665e17db6cd392cc18ba9518db22206
  const [loading, setLoading] = useState(true)
  const [editingPuesto, setEditingPuesto] = useState(false)
  const [puestoData, setPuestoData] = useState<Partial<Puesto>>({})
  const [fotos, setFotos] = useState<FotoPreview[]>([])
  const [fotosExistentes, setFotosExistentes] = useState<string[]>([])
  const [fotosExistentesB64, setFotosExistentesB64] = useState<string[]>([])

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return

      try {
        setLoading(true)
        
        // 1. Obtener información del puesto
<<<<<<< HEAD
        const dataPuesto = await getPuestoByUserId(user.id) as Puesto
=======
        const dataPuesto = await getPuestoByUserId(user.id)
>>>>>>> 4325f1856665e17db6cd392cc18ba9518db22206
        if (dataPuesto) {
          setPuesto(dataPuesto as Puesto)
          setPuestoData(dataPuesto as Partial<Puesto>)
          setFotosExistentes((dataPuesto as any).fotosNombres || [])
          setFotosExistentesB64((dataPuesto as any).fotosBase64 || [])
        }

        // 2. Obtener información de la feria si tiene vinculada una
        if (user.feriaId) {
          const feriaData = await getFeriaById(user.feriaId)
          setFeria(feriaData as Feria)

          // 3. Obtener productos de esta feria
<<<<<<< HEAD
          const allProductos = await getProductos() as Producto[]
          const productosDeFeria = allProductos.filter((p: Producto) =>
            p.precios?.some((precio) => precio.feriaId === user.feriaId)
=======
          const allProductos = await getProductos()
          const productosDeFeria = allProductos.filter((p: any) =>
            p.precios?.some((precio: any) => precio.feriaId === user.feriaId)
>>>>>>> 4325f1856665e17db6cd392cc18ba9518db22206
          )
          setProductosFeria(productosDeFeria)
        }
      } catch (error) {
        console.error('Error al cargar datos:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user])

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
          confirmButtonColor: '#2d8a42',
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

  const handleSavePuesto = async () => {
    if (!puesto || !puesto.id) return

    // Validaciones
    if (!puestoData.nombrePuesto?.trim() || !puestoData.ubicacion?.trim() || !puestoData.descripcion?.trim()) {
      Swal.fire('Atención', 'Nombre, ubicación y descripción son obligatorios', 'warning')
      return
    }

    try {
      const fotosNombres = [
        ...fotosExistentes,
        ...fotos.map(f => f.file.name)
      ];
      
      const fotosBase64Array = [
        ...fotosExistentesB64,
        ...fotos.map(f => f.preview)
      ];

      const updatedData = {
        ...puestoData,
        nombrePuesto: puestoData.nombrePuesto.trim(),
        ubicacion: puestoData.ubicacion.trim(),
        descripcion: puestoData.descripcion.trim(),
        telefono: puestoData.telefono?.trim(),
        email: puestoData.email?.trim(),
        horarios: puestoData.horarios?.trim(),
        metodosCultivo: puestoData.metodosCultivo?.trim(),
        redesSociales: puestoData.redesSociales?.trim(),
        fotosNombres,
        fotosBase64: fotosBase64Array,
      }

      await updatePuesto(puesto.id, updatedData)
      setPuesto(updatedData as Puesto)
      setEditingPuesto(false)
      Swal.fire('¡Éxito!', 'Información del puesto actualizada correctamente', 'success')
    } catch (error) {
      console.error('Error al actualizar puesto:', error)
      Swal.fire('Error', 'No se pudo actualizar la información', 'error')
    }
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="admin-layout">
          <AdminSidebar />
          <div className="admin-main">
            <AdminHeader title="Mi Feria" subtitle="Información de tu feria y puesto" />
            <div className="admin-content">
              <p>Cargando información...</p>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className="admin-layout">
        <AdminSidebar />
        <div className="admin-main">
          <AdminHeader title="Mi Feria" subtitle="Información de tu feria y puesto" />
          <div className="admin-content">
            
            {/* Información de la Feria */}
            {feria && (
              <div className="mis-ferias-card">
                <div className="mis-ferias-card-header">
                  <h3>🏪 Información de la Feria</h3>
                </div>
                <div className="mis-ferias-card-body">
                  <div className="mis-ferias-info-grid">
                    <div className="mis-ferias-info-item">
                      <span className="mis-ferias-info-label">Nombre:</span>
                      <span className="mis-ferias-info-value">{feria.emoji} {feria.nombre}</span>
                    </div>
                    <div className="mis-ferias-info-item">
                      <span className="mis-ferias-info-label">Ubicación:</span>
                      <span className="mis-ferias-info-value">{feria.ubicacion}</span>
                    </div>
                    <div className="mis-ferias-info-item">
                      <span className="mis-ferias-info-label">Provincia:</span>
                      <span className="mis-ferias-info-value">{feria.provincia}</span>
                    </div>
                    <div className="mis-ferias-info-item">
                      <span className="mis-ferias-info-label">Horario:</span>
                      <span className="mis-ferias-info-value">{feria.horario}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Información del Puesto (Basado en el registro) */}
            <div className="mis-ferias-card">
              <div className="mis-ferias-card-header">
                <h3>📍 Mi Puesto</h3>
                {!editingPuesto && (
                  <button onClick={() => setEditingPuesto(true)} className="mis-ferias-edit-btn">
                    ✏️ Editar Información
                  </button>
                )}
              </div>
              <div className="mis-ferias-card-body">
                {editingPuesto ? (
                  <div className="mis-ferias-edit-form">
                    <div className="mis-ferias-form-row">
                      <div className="mis-ferias-form-group">
                        <label>Nombre del Puesto</label>
                        <input
                          type="text"
                          value={puestoData.nombrePuesto || ''}
                          onChange={(e) => setPuestoData({ ...puestoData, nombrePuesto: e.target.value })}
                        />
                      </div>
                      <div className="mis-ferias-form-group">
                        <label>Ubicación detallada (o # de puesto)</label>
                        <input
                          type="text"
                          value={puestoData.ubicacion || ''}
                          onChange={(e) => setPuestoData({ ...puestoData, ubicacion: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="mis-ferias-form-group">
                      <label>Descripción</label>
                      <textarea
                        value={puestoData.descripcion || ''}
                        onChange={(e) => setPuestoData({ ...puestoData, descripcion: e.target.value })}
                        rows={3}
                      />
                    </div>

                    <div className="mis-ferias-form-row">
                      <div className="mis-ferias-form-group">
                        <label>Teléfono</label>
                        <input
                          type="tel"
                          value={puestoData.telefono || ''}
                          onChange={(e) => setPuestoData({ ...puestoData, telefono: e.target.value })}
                        />
                      </div>
                      <div className="mis-ferias-form-group">
                        <label>Email de contacto</label>
                        <input
                          type="email"
                          value={puestoData.email || ''}
                          onChange={(e) => setPuestoData({ ...puestoData, email: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="mis-ferias-form-group">
                      <label>Horarios específicos</label>
                      <input
                        type="text"
                        value={puestoData.horarios || ''}
                        onChange={(e) => setPuestoData({ ...puestoData, horarios: e.target.value })}
                      />
                    </div>

                    <div className="mis-ferias-form-group">
                      <label>Métodos de cultivo</label>
                      <textarea
                        value={puestoData.metodosCultivo || ''}
                        onChange={(e) => setPuestoData({ ...puestoData, metodosCultivo: e.target.value })}
                        rows={2}
                      />
                    </div>

                    <div className="mis-ferias-form-group full-width">
                      <label style={{ fontWeight: 600, display: 'block', marginBottom: '10px' }}>Fotos del puesto y productos (JPG, PNG o WebP · Máx 6 fotos)</label>
                      
                      {fotosExistentesB64.length > 0 && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '10px', marginBottom: '10px' }}>
                          {fotosExistentesB64.map((b64, i) => (
                            <div key={`exist-${i}`} style={{position: 'relative'}}>
                              <img src={b64} alt={`Foto ${i + 1}`} style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                              <button type="button" onClick={() => handleRemoveFotoExistente(i)} style={{position: 'absolute', top: '5px', right: '5px', background: 'red', color: 'white', borderRadius: '50%', width: '25px', height: '25px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>✕</button>
                            </div>
                          ))}
                        </div>
                      )}

                      {fotos.length > 0 && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '10px', marginBottom: '10px' }}>
                          {fotos.map((foto, i) => (
                            <div key={`new-${i}`} style={{position: 'relative'}}>
                              <img src={foto.preview} alt={`Foto ${i + 1}`} style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                              <button type="button" onClick={() => handleRemoveFoto(i)} style={{position: 'absolute', top: '5px', right: '5px', background: 'red', color: 'white', borderRadius: '50%', width: '25px', height: '25px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>✕</button>
                            </div>
                          ))}
                        </div>
                      )}

                      {(fotos.length + fotosExistentes.length) < 6 && (
                        <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '2px dashed #cbd5e1', padding: '20px', borderRadius: '8px', background: '#f8fafc', cursor: 'pointer', textAlign: 'center' }}>
                          <input
                            type="file"
                            accept=".jpg,.jpeg,.png,.webp"
                            multiple
                            onChange={handleFotosChange}
                            style={{ display: 'none' }}
                          />
                          <span style={{ fontSize: '24px', marginBottom: '8px' }}>📷</span>
                          <strong style={{ color: '#0f172a', fontSize: '14px' }}>Hacé clic para seleccionar imágenes</strong>
                          <span style={{ color: '#64748b', fontSize: '12px', marginTop: '4px' }}>JPG, PNG o WebP · {6 - fotos.length - fotosExistentes.length} foto(s) restante(s)</span>
                        </label>
                      )}
                    </div>

                    <div className="mis-ferias-form-actions">
                      <button onClick={() => setEditingPuesto(false)} className="mis-ferias-btn-cancel">
                        Cancelar
                      </button>
                      <button onClick={handleSavePuesto} className="mis-ferias-btn-save">
                        Guardar Cambios
                      </button>
                    </div>
                  </div>
                ) : puesto ? (
                  <div className="mis-ferias-info-grid">
                    <div className="mis-ferias-info-item">
                      <span className="mis-ferias-info-label">Nombre del Puesto:</span>
                      <span className="mis-ferias-info-value">{puesto.nombrePuesto}</span>
                    </div>
                    <div className="mis-ferias-info-item">
                      <span className="mis-ferias-info-label">Ubicación/Puesto:</span>
                      <span className="mis-ferias-info-value">{puesto.ubicacion}</span>
                    </div>
                    <div className="mis-ferias-info-item full-width">
                      <span className="mis-ferias-info-label">Descripción:</span>
                      <span className="mis-ferias-info-value">{puesto.descripcion}</span>
                    </div>
                    <div className="mis-ferias-info-item">
                      <span className="mis-ferias-info-label">Teléfono:</span>
                      <span className="mis-ferias-info-value">{puesto.telefono}</span>
                    </div>
                    <div className="mis-ferias-info-item">
                      <span className="mis-ferias-info-label">Email:</span>
                      <span className="mis-ferias-info-value">{puesto.email}</span>
                    </div>
                    <div className="mis-ferias-info-item">
                      <span className="mis-ferias-info-label">Horarios:</span>
                      <span className="mis-ferias-info-value">{puesto.horarios || 'No especificado'}</span>
                    </div>
                    <div className="mis-ferias-info-item">
                      <span className="mis-ferias-info-label">Métodos de cultivo:</span>
                      <span className="mis-ferias-info-value">{puesto.metodosCultivo || 'No especificado'}</span>
                    </div>
                    {puesto.tiposProducto && puesto.tiposProducto.length > 0 && (
                      <div className="mis-ferias-info-item full-width">
                        <span className="mis-ferias-info-label">Productos autorizados:</span>
                        <div className="mis-ferias-tags">
                          {puesto.tiposProducto.map(tipo => (
                            <span key={tipo} className="mis-feria-tag">{tipo}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {puesto.fotosBase64 && puesto.fotosBase64.length > 0 && (
                      <div className="mis-ferias-info-item full-width">
                        <span className="mis-ferias-info-label">Fotos del puesto:</span>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '10px', marginTop: '10px' }}>
                          {puesto.fotosBase64.map((foto, index) => (
                            <img key={index} src={foto} alt={`Foto ${index + 1}`} style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p>No se encontró información del puesto. Completá tu perfil de agricultor.</p>
                )}
              </div>
            </div>

            {/* Productos en esta Feria */}
            {feria && (
              <div className="mis-ferias-card">
                <div className="mis-ferias-card-header">
                  <h3>🛒 Mis Productos en {feria.nombre}</h3>
                  <span className="mis-ferias-count">{productosFeria.length} productos</span>
                </div>
                <div className="mis-ferias-card-body">
                  {productosFeria.length > 0 ? (
                    <div className="mis-ferias-productos-grid">
                      {productosFeria.map((producto) => {
                        const precioEnFeria = producto.precios?.find(
                          (p: any) => p.feriaId === user?.feriaId
                        )
                        return (
                          <div key={producto.id} className="mis-ferias-producto-item">
                            <span className="mis-ferias-producto-emoji">{producto.emoji}</span>
                            <div className="mis-ferias-producto-info">
                              <div className="mis-ferias-producto-name">{producto.nombre}</div>
                              {precioEnFeria && (
                                <div className="mis-ferias-producto-precio">
                                  ₡{precioEnFeria.precio.toLocaleString('es-CR')}
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <p className="mis-ferias-empty">Aún no has agregado productos a esta feria.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default MisFerias
