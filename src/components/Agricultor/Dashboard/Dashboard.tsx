import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Navbar from '../../Navbar/Navbar'
import Footer from '../../Footer/Footer'
import AgricultorSidebar from '../../adminAgricultor/AgricultorSidebar'
import AdminHeader from '../../adminAgricultor/AgricultorHeader'
import AdminStats from '../../adminAgricultor/AgricultorStats'
import { getProductosByUser, Producto } from '../../../servers/ProductService'
import { getPuestoByUserId } from '../../../servers/AgricultorServices'
import './Dashboard.css'

interface PuestoData {
  id?: string
  nombrePuesto?: string
  descripcion?: string
  ubicacion?: string | string[]
  numero?: string
  telefono?: string
  email?: string
  horarios?: string
  metodosCultivo?: string
  redesSociales?: string
  tiposProducto?: string[]
  fotosBase64?: string[]
}

const Dashboard: React.FC = () => {
  const { user } = useAuth()
  
  const [puesto, setPuesto] = useState<PuestoData | null>(null)
  const [stats, setStats] = useState({ totalProductos: 0, productosActivos: 0 })
  const [recentProducts, setRecentProducts] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return
      try {
        setLoading(true)
        const productos = await getProductosByUser(user.id)
        const puestoData = await getPuestoByUserId(user.id) as PuestoData | null
        if (puestoData) setPuesto(puestoData)

        const activos = productos.filter((p) => p.disponible).length
        setStats({ totalProductos: productos.length, productosActivos: activos })
        setRecentProducts(productos.slice(-3).reverse())
      } catch (error) {
        console.error('Error al cargar dashboard:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [user])

  const ubicacionTexto = Array.isArray(puesto?.ubicacion)
    ? puesto.ubicacion.join(', ')
    : (puesto?.ubicacion || 'N/A')

  return (
    <>
      <Navbar />
      <div className="admin-layout">
        <AgricultorSidebar />
        <div className="admin-main">
          <AdminHeader
            title="Dashboard"
            subtitle="Vista general de tu panel de agricultor"
          />
          <div className="admin-content">
            <AdminStats stats={{
                totalProductos: stats.totalProductos,
                productosActivos: stats.productosActivos,
                puestoNumero: ubicacionTexto
              }} 
            />

            {/* Grid principal */}
            <div className="dashboard-grid">
              {/* Información del Puesto */}
              <div className="dashboard-card">
                <div className="dashboard-card-header">
                  <h3>📋 Mi Puesto</h3>
                  <Link to="/registro-agricultor" className="dashboard-card-link">✏️ Editar</Link>
                </div>
                <div className="dashboard-card-body">
                  {loading ? (
                    <p className="dashboard-card-empty">Cargando...</p>
                  ) : puesto ? (
                    <div className="dashboard-feria-info">
                      <div className="dashboard-feria-item">
                        <span className="dashboard-feria-label">Nombre del puesto</span>
                        <span className="dashboard-feria-value">{puesto.nombrePuesto || 'No especificado'}</span>
                      </div>
                      <div className="dashboard-feria-item">
                        <span className="dashboard-feria-label">Feria seleccionada</span>
                        <span className="dashboard-feria-value">{ubicacionTexto}</span>
                      </div>
                      <div className="dashboard-feria-item">
                        <span className="dashboard-feria-label">Teléfono</span>
                        <span className="dashboard-feria-value">{puesto.telefono || 'No especificado'}</span>
                      </div>
                      <div className="dashboard-feria-item">
                        <span className="dashboard-feria-label">Email de contacto</span>
                        <span className="dashboard-feria-value">{puesto.email || 'No especificado'}</span>
                      </div>
                      <div className="dashboard-feria-item">
                        <span className="dashboard-feria-label">Horarios</span>
                        <span className="dashboard-feria-value">{puesto.horarios || 'No especificado'}</span>
                      </div>
                      <div className="dashboard-feria-item" style={{ gridColumn: 'span 2' }}>
                        <span className="dashboard-feria-label">Descripción</span>
                        <span className="dashboard-feria-value" style={{ fontWeight: 400 }}>{puesto.descripcion || 'Sin descripción'}</span>
                      </div>
                      
                      {puesto.tiposProducto && puesto.tiposProducto.length > 0 && (
                        <div className="dashboard-feria-item" style={{ gridColumn: 'span 2' }}>
                          <span className="dashboard-feria-label">Tipos de producto</span>
                          <div className="dashboard-tags">
                            {puesto.tiposProducto.map(t => (
                              <span key={t} className="dashboard-tag">{t}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {puesto.metodosCultivo && (
                        <div className="dashboard-feria-item" style={{ gridColumn: 'span 2' }}>
                          <span className="dashboard-feria-label">Métodos de cultivo</span>
                          <span className="dashboard-feria-value" style={{ fontWeight: 400 }}>{puesto.metodosCultivo}</span>
                        </div>
                      )}

                      {puesto.redesSociales && (
                        <div className="dashboard-feria-item" style={{ gridColumn: 'span 2' }}>
                          <span className="dashboard-feria-label">Redes sociales</span>
                          <span className="dashboard-feria-value" style={{ fontWeight: 400 }}>{puesto.redesSociales}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="dashboard-card-empty">
                      <p>No tienes un puesto registrado aún.</p>
                      <Link to="/registro-agricultor">Completar registro ➔</Link>
                    </div>
                  )}
                </div>
              </div>

              {/* Productos Recientes */}
              <div className="dashboard-card">
                <div className="dashboard-card-header">
                  <h3>🛒 Productos Recientes</h3>
                  <Link to="/agricultor/productos" className="dashboard-card-link">Ver todos →</Link>
                </div>
                <div className="dashboard-card-body">
                  {loading ? (
                    <p className="dashboard-card-empty">Cargando...</p>
                  ) : recentProducts.length > 0 ? (
                    <div className="dashboard-products-list">
                      {recentProducts.map((p) => (
                        <div key={p.id} className="dashboard-product-item">
                          <span className="dashboard-product-emoji">{p.emoji}</span>
                          <div className="dashboard-product-info">
                            <div className="dashboard-product-name">{p.nombre}</div>
                            <div className="dashboard-product-meta">
                              ₡{p.precios?.[0]?.precio ?? 0} / {p.unidad || 'Unidad'}
                            </div>
                          </div>
                          <span className={`dashboard-product-status ${p.disponible ? 'active' : 'inactive'}`}>
                            {p.disponible ? 'Activo' : 'Agotado'}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="dashboard-card-empty">
                      No tienes productos registrados. <Link to="/agricultor/productos">Agregar producto</Link>
                    </p>
                  )}
                </div>
              </div>
            </div>


          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default Dashboard
