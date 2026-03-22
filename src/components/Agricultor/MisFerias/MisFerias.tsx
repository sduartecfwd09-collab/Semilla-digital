import React, { useState, useEffect } from 'react'
import Swal from 'sweetalert2'
import { useAuth } from '../../context/AuthContext'
import Navbar from '../../Navbar/Navbar'
import AdminSidebar from '../../adminAgricultor/AgricultorSidebar'
import AdminHeader from '../../adminAgricultor/AgricultorHeader'
import { Producto } from '../../../servers/ProductService'
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
}

const MisFerias: React.FC = () => {
  const { user } = useAuth()
  const [feria, setFeria] = useState<Feria | null>(null)
  const [puesto, setPuesto] = useState<Puesto | null>(null)
  const [productosFeria, setProductosFeria] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const [editingPuesto, setEditingPuesto] = useState(false)
  const [puestoData, setPuestoData] = useState<Partial<Puesto>>({})

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return

      try {
        setLoading(true)
        
        // 1. Obtener información del puesto
        const dataPuesto = await getPuestoByUserId(user.id) as Puesto
        if (dataPuesto) {
          setPuesto(dataPuesto)
          setPuestoData(dataPuesto)
        }

        // 2. Obtener información de la feria si tiene vinculada una
        if (user.feriaId) {
          const feriaData = await getFeriaById(user.feriaId)
          setFeria(feriaData as Feria)

          // 3. Obtener productos de esta feria
          const allProductos = await getProductos() as Producto[]
          const productosDeFeria = allProductos.filter((p: Producto) =>
            p.precios?.some((precio) => precio.feriaId === user.feriaId)
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

  const handleSavePuesto = async () => {
    if (!puesto || !puesto.id) return

    // Validaciones
    if (!puestoData.nombrePuesto?.trim() || !puestoData.ubicacion?.trim() || !puestoData.descripcion?.trim()) {
      Swal.fire('Atención', 'Nombre, ubicación y descripción son obligatorios', 'warning')
      return
    }

    try {
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
