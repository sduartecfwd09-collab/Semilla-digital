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
  interface FeriaData {
    nombre?: string
  }

  interface PuestoData {
    nombrePuesto?: string
    descripcion?: string
    ubicacion?: string
    numero?: string
  }

  const [stats, setStats] = useState({
    totalProductos: 0,
    productosActivos: 0,
    puestoNombre: '',
    puestoDescripcion: '',
    puestoUbicacion: '',
    feriaNombre: '',
    puestoNumero: '',
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
        const puesto = await getPuestoByUserId(user.id) as PuestoData | null;

        // 3. Obtener información de la feria
        let feria: FeriaData | null = null;
        if (user.feriaId) {
          try {
            feria = await getFeriaById(user.feriaId);
          } catch (error) {
            console.warn('Feria no encontrada:', user.feriaId, error);
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
          feriaNombre: feria?.nombre || 'N/A',
          puestoNumero: puesto?.numero || 'N/A',
        })

        // Obtener productos recientes (últimos 3)
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
                  <Link to="/admin/productos" className="dashboard-card-link">
                    Ver todos →
                  </Link>
                </div>
                <div className="dashboard-card-body">
                  {loading ? (
                    <p className="dashboard-card-empty">Cargando...</p>
                  ) : recentProducts.length > 0 ? (
                    <ul className="dashboard-recent-list">
                      {recentProducts.map((producto) => (
                        <li key={producto.id}>{producto.nombre}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="dashboard-card-empty">No hay productos recientes.</p>
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

            {/* Información de la Feria */}
            <div className="dashboard-card">
              <div className="dashboard-card-header">
                <h3>Mi Feria</h3>
                <Link to="/admin/ferias" className="dashboard-card-link">
                  Ver detalles →
                </Link>
              </div>
              <div className="dashboard-card-body">
                {loading ? (
                  <p className="dashboard-card-empty">Cargando...</p>
                ) : (
                  <div className="dashboard-feria-info">
                    <div className="dashboard-feria-item">
                      <span className="dashboard-feria-label">Feria:</span>
                      <span className="dashboard-feria-value">{stats.feriaNombre}</span>
                    </div>
                    <div className="dashboard-feria-item">
                      <span className="dashboard-feria-label">Puesto:</span>
                      <span className="dashboard-feria-value">{stats.puestoNumero}</span>
                    </div>
                    <div className="dashboard-feria-item">
                      <span className="dashboard-feria-label">Descripción:</span>
                      <span className="dashboard-feria-value">
                        {user?.puestoInfo?.descripcion || 'N/A'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Acciones Rápidas */}
          <div className="dashboard-quick-actions">
            <h3>Acciones Rápidas</h3>
            <div className="dashboard-actions-grid">
              <Link to="/admin/productos" className="dashboard-action-card">
                <span className="dashboard-action-icon">➕</span>
                <span className="dashboard-action-label">Agregar Producto</span>
              </Link>
              <Link to="/admin/productos" className="dashboard-action-card">
                <span className="dashboard-action-icon">📝</span>
                <span className="dashboard-action-label">Editar Productos</span>
              </Link>
              <Link to="/admin/ferias" className="dashboard-action-card">
                <span className="dashboard-action-icon">🏪</span>
                <span className="dashboard-action-label">Ver Mi Feria</span>
              </Link>
              <Link to="/admin/config" className="dashboard-action-card">
                <span className="dashboard-action-icon">⚙️</span>
                <span className="dashboard-action-label">Configuración</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </>
  )
}

export default Dashboard
