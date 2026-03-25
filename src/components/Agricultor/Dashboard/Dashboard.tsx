import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Navbar from '../../Navbar/Navbar'
import AgricultorSidebar from '../../adminAgricultor/AgricultorSidebar'
import AdminHeader from '../../adminAgricultor/AgricultorHeader'
import AdminStats from '../../adminAgricultor/AgricultorStats'
import { getProductosByUser, Producto } from '../../../servers/ProductService'
import { getFeriaById, getPuestoByUserId } from '../../../servers/AgricultorServices'
import './Dashboard.css'

const Dashboard: React.FC = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalProductos: 0,
    productosActivos: 0,
    puestoNombre: '',
    puestoDescripcion: '',
    puestoUbicacion: '',
  })
  const [recentProducts, setRecentProducts] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return

      try {
        setLoading(true)
        
        // Obtener productos del usuario
        const productos = await getProductosByUser(user.id)
        
        // 2. Obtener información del puesto real
        const puesto = await getPuestoByUserId(user.id) as any;

        // 3. Obtener información de la feria
        let feria = null;
        if (user.feriaId) {
          try {
            feria = await getFeriaById(user.feriaId);
          } catch (e) {
            console.warn('Feria no encontrada:', user.feriaId);
          }
        }

        // Calcular estadísticas
        const activos = productos.filter((p) => p.disponible).length
        
        setStats({
          totalProductos: productos.length,
          productosActivos: activos,
          puestoNombre: puesto?.nombrePuesto || 'N/A',
          puestoDescripcion: puesto?.descripcion || 'No especificada',
          puestoUbicacion: puesto?.ubicacion || 'N/A',
        })

        setRecentProducts(productos.slice(-3).reverse())
      } catch (error) {
        console.error('Error al cargar dashboard:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user])

  return (
    <>
      <Navbar />
      <div className="admin-layout">
        <AgricultorSidebar />
        <div className="admin-main">
          <AdminHeader
            title="Dashboard"
            subtitle="Vista general de tu panel de administración"
          />
          <div className="admin-content">
            <AdminStats stats={{
                totalProductos: stats.totalProductos,
                productosActivos: stats.productosActivos,
                puestoNumero: stats.puestoUbicacion
            }} />

            <div className="dashboard-grid">
              {/* Productos Recientes */}
              <div className="dashboard-card">
                <div className="dashboard-card-header">
                  <h3>Productos Recientes</h3>
                  <Link to="/agricultor/productos" className="dashboard-card-link">
                    Ver todos →
                  </Link>
                </div>
                <div className="dashboard-card-body">
                  {loading ? (
                    <p className="dashboard-card-empty">Cargando...</p>
                  ) : recentProducts.length > 0 ? (
                    <div className="dashboard-products-list">
                      {recentProducts.map((producto) => (
                        <div key={producto.id} className="dashboard-product-item">
                          <span className="dashboard-product-emoji">{producto.emoji}</span>
                          <div className="dashboard-product-info">
                            <div className="dashboard-product-name">{producto.nombre}</div>
                            <div className="dashboard-product-meta">
                              {producto.categoria} · {producto.precios.length} feria
                              {producto.precios.length !== 1 ? 's' : ''}
                            </div>
                          </div>
                          <span
                            className={`dashboard-product-status ${
                              producto.disponible ? 'active' : 'inactive'
                            }`}
                          >
                            {producto.disponible ? '✓ Activo' : '✕ Inactivo'}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="dashboard-card-empty">
                      No tienes productos. <Link to="/agricultor/productos">Crea uno ahora</Link>
                    </p>
                  )}
                </div>
              </div>

              {/* Información de la Feria */}
              <div className="dashboard-card">
                <div className="dashboard-card-header">
                  <h3>Mi Puesto</h3>
                  <Link to="/agricultor/ferias" className="dashboard-card-link">
                    Ver detalles →
                  </Link>
                </div>
                <div className="dashboard-card-body">
                  {loading ? (
                    <p className="dashboard-card-empty">Cargando...</p>
                  ) : (
                    <div className="dashboard-feria-info">
                      <div className="dashboard-feria-item">
                        <span className="dashboard-feria-label">Nombre:</span>
                        <span className="dashboard-feria-value">{stats.puestoNombre}</span>
                      </div>
                      <div className="dashboard-feria-item">
                        <span className="dashboard-feria-label">Ubicación:</span>
                        <span className="dashboard-feria-value">{stats.puestoUbicacion}</span>
                      </div>

                      <div className="dashboard-feria-item">
                        <span className="dashboard-feria-label">Descripción:</span>
                        <span className="dashboard-feria-value">
                          {stats.puestoDescripcion}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Dashboard
