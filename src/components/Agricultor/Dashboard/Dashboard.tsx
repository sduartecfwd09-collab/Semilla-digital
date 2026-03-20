import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import AdminSidebar from '../../adminAgricultor/AgricultorSidebar'
import AdminHeader from '../../adminAgricultor/AgricultorHeader'
import AdminStats from '../../adminAgricultor/AgricultorStats'
import { getProductosByUser, Producto } from '../../../servers/ProductService'
import { getFeriaById } from '../../../servers/AgricultorServices'
import './Dashboard.css'

const Dashboard: React.FC = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalProductos: 0,
    productosActivos: 0,
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
        
        // Obtener información de la feria
        const feria: any = await getFeriaById(user.feriaId)

        // Calcular estadísticas
        const activos = productos.filter((p) => p.disponible).length
        
        setStats({
          totalProductos: productos.length,
          productosActivos: activos,
          feriaNombre: feria.nombre,
          puestoNumero: user.puestoInfo.numero,
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
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-main">
        <AdminHeader
          title="Dashboard"
          subtitle="Vista general de tu panel de administración"
        />
        <div className="admin-content">
          <AdminStats stats={stats} />

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
                    No tienes productos. <Link to="/admin/productos">Crea uno ahora</Link>
                  </p>
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
                        {user?.puestoInfo.descripcion}
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
  )
}

export default Dashboard
