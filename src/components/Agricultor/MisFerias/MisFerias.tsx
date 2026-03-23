import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import AdminSidebar from '../../adminAgricultor/AgricultorSidebar'
import AdminHeader from '../../adminAgricultor/AgricultorHeader'
import { getFeriaById, getProductos } from '../../../servers/AgricultorServices'
import { Producto } from '../../../servers/ProductService'
import { updateUser } from '../../../servers/AuthService'
import ProductIcon from '../../../utils/productIcons'
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

const MisFerias: React.FC = () => {
  const { user } = useAuth()
  const [feria, setFeria] = useState<Feria | null>(null)
  const [productosFeria, setProductosFeria] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const [editingPuesto, setEditingPuesto] = useState(false)
  const [puestoData, setPuestoData] = useState({
    numero: user?.puestoInfo.numero || '',
    descripcion: user?.puestoInfo.descripcion || '',
  })

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return

      try {
        setLoading(true)
        
        // Obtener información de la feria
        const feriaData = await getFeriaById(user.feriaId)
        setFeria(feriaData as Feria)

        // Obtener todos los productos y filtrar por feria
        const allProductos = await getProductos()
        const productosDeFeria = allProductos.filter((p: Producto) =>
          p.precios.some((precio: { feriaId: number }) => precio.feriaId === user.feriaId)
        )
        setProductosFeria(productosDeFeria)
      } catch (error) {
        console.error('Error al cargar datos:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user])

  const handleSavePuesto = async () => {
    if (!user) return

    try {
      await updateUser(user.id, {
        puestoInfo: puestoData,
      })
      
      // Actualizar localStorage
      const storedUser = JSON.parse(localStorage.getItem('auth_user') || '{}')
      storedUser.puestoInfo = puestoData
      localStorage.setItem('auth_user', JSON.stringify(storedUser))
      
      setEditingPuesto(false)
      alert('Información del puesto actualizada correctamente')
    } catch (error) {
      console.error('Error al actualizar puesto:', error)
      alert('Error al actualizar la información')
    }
  }

  if (loading) {
    return (
      <div className="admin-layout">
        <AdminSidebar />
        <div className="admin-main">
          <AdminHeader title="Mi Feria" subtitle="Información de tu feria y puesto" />
          <div className="admin-content">
            <p>Cargando...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-main">
        <AdminHeader title="Mi Feria" subtitle="Información de tu feria y puesto" />
        <div className="admin-content">
          {/* Información de la Feria */}
          <div className="mis-ferias-card">
            <div className="mis-ferias-card-header">
              <h3>🏪 Información de la Feria</h3>
            </div>
            <div className="mis-ferias-card-body">
              {feria && (
                <div className="mis-ferias-info-grid">
                  <div className="mis-ferias-info-item">
                    <span className="mis-ferias-info-label">Nombre:</span>
                    <span className="mis-ferias-info-value mis-ferias-feria-nombre">
                      <ProductIcon categoria="Verduras" size={16} />
                      {feria.nombre}
                    </span>
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
              )}
            </div>
          </div>

          {/* Información del Puesto */}
          <div className="mis-ferias-card">
            <div className="mis-ferias-card-header">
              <h3>📍 Mi Puesto</h3>
              {!editingPuesto && (
                <button
                  onClick={() => setEditingPuesto(true)}
                  className="mis-ferias-edit-btn"
                >
                  ✏️ Editar
                </button>
              )}
            </div>
            <div className="mis-ferias-card-body">
              {editingPuesto ? (
                <div className="mis-ferias-edit-form">
                  <div className="mis-ferias-form-group">
                    <label>Número de Puesto</label>
                    <input
                      type="text"
                      value={puestoData.numero}
                      onChange={(e) =>
                        setPuestoData({ ...puestoData, numero: e.target.value })
                      }
                      placeholder="ej: A-12"
                    />
                  </div>
                  <div className="mis-ferias-form-group">
                    <label>Descripción</label>
                    <textarea
                      value={puestoData.descripcion}
                      onChange={(e) =>
                        setPuestoData({ ...puestoData, descripcion: e.target.value })
                      }
                      placeholder="ej: Puesto de verduras y frutas frescas"
                      rows={3}
                    />
                  </div>
                  <div className="mis-ferias-form-actions">
                    <button
                      onClick={() => setEditingPuesto(false)}
                      className="mis-ferias-btn-cancel"
                    >
                      Cancelar
                    </button>
                    <button onClick={handleSavePuesto} className="mis-ferias-btn-save">
                      Guardar Cambios
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mis-ferias-info-grid">
                  <div className="mis-ferias-info-item">
                    <span className="mis-ferias-info-label">Número:</span>
                    <span className="mis-ferias-info-value">{user?.puestoInfo.numero}</span>
                  </div>
                  <div className="mis-ferias-info-item">
                    <span className="mis-ferias-info-label">Descripción:</span>
                    <span className="mis-ferias-info-value">
                      {user?.puestoInfo.descripcion}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Productos en esta Feria */}
          <div className="mis-ferias-card">
            <div className="mis-ferias-card-header">
              <h3>🛒 Productos en esta Feria</h3>
              <span className="mis-ferias-count">{productosFeria.length} productos</span>
            </div>
            <div className="mis-ferias-card-body">
              {productosFeria.length > 0 ? (
                <div className="mis-ferias-productos-grid">
                  {productosFeria.slice(0, 12).map((producto) => {
                    const precioEnFeria = producto.precios.find(
                      (p: { feriaId: number }) => p.feriaId === user?.feriaId
                    )
                    return (
                      <div key={producto.id} className="mis-ferias-producto-item">
                        <span className="mis-ferias-producto-emoji">
                          <ProductIcon
                            emoji={producto.emoji}
                            categoria={producto.categoria}
                            size={18}
                            showBg
                            containerSize={38}
                          />
                        </span>
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
                <p className="mis-ferias-empty">No hay productos disponibles en esta feria</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MisFerias
