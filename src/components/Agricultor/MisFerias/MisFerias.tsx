import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Navbar from '../../Navbar/Navbar'
import AdminSidebar from '../../adminAgricultor/AgricultorSidebar'
import AdminHeader from '../../adminAgricultor/AgricultorHeader'
import Footer from '../../Footer/Footer'
import { getPuestoByUserId, getProductos } from '../../../servers/AgricultorServices'
import './MisFerias.css'
import { Producto } from '../../../servers/ProductService'

interface Puesto {
  id: string | number
  nombrePuesto: string
  descripcion: string
  ubicacion: string | string[]
  telefono: string
  email: string
  horarios?: string
  horariosList?: { dia: string; inicio: string; fin: string }[]
  metodosCultivo?: string
  redesSociales?: string
  tiposProducto?: string[]
  fotosNombres?: string[]
  fotosBase64?: string[]
}

const MisFerias: React.FC = () => {
  const { user } = useAuth()
  const [puesto, setPuesto] = useState<Puesto | null>(null)
  const [productosFeria, setProductosFeria] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return
      try {
        setLoading(true)
        const dataPuesto = await getPuestoByUserId(user.id) as Puesto
        if (dataPuesto) setPuesto(dataPuesto)

        if (user.feriaId) {
          const allProductos = await getProductos() as Producto[]
          const productosDeFeria = allProductos.filter((p: Producto) =>
            p.precios?.some((precio) => String(precio.feriaId) === String(user.feriaId))
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

  const ubicacionTexto = Array.isArray(puesto?.ubicacion)
    ? puesto.ubicacion.join(', ')
    : (puesto?.ubicacion || 'N/A')

  return (
    <>
      <Navbar />
      <div className="admin-layout">
        <AdminSidebar />
        <div className="admin-main">
          <AdminHeader title="Mi Feria" subtitle="Información de tu puesto y feria asignada" />
          <div className="admin-content">
            {loading ? (
              <p style={{ padding: '2rem', textAlign: 'center', color: '#999' }}>Cargando información...</p>
            ) : (
              <>
                {/* Datos del Puesto — toda la info del formulario */}
                <div className="mis-ferias-card">
                  <div className="mis-ferias-card-header">
                    <h3>📋 Información de Mi Puesto</h3>
                    <Link to="/registro-agricultor" className="mis-ferias-edit-btn">
                      ✏️ Editar Información
                    </Link>
                  </div>
                  <div className="mis-ferias-card-body">
                    {puesto ? (
                      <div className="mis-ferias-info-grid">
                        <div className="mis-ferias-info-item">
                          <span className="mis-ferias-info-label">Nombre del puesto</span>
                          <span className="mis-ferias-info-value">{puesto.nombrePuesto || 'No especificado'}</span>
                        </div>
                        <div className="mis-ferias-info-item">
                          <span className="mis-ferias-info-label">Feria seleccionada</span>
                          <span className="mis-ferias-info-value">{ubicacionTexto}</span>
                        </div>
                        <div className="mis-ferias-info-item">
                          <span className="mis-ferias-info-label">Teléfono</span>
                          <span className="mis-ferias-info-value">{puesto.telefono || 'No especificado'}</span>
                        </div>
                        <div className="mis-ferias-info-item">
                          <span className="mis-ferias-info-label">Email de contacto</span>
                          <span className="mis-ferias-info-value">{puesto.email || 'No especificado'}</span>
                        </div>
                        <div className="mis-ferias-info-item" style={{ gridColumn: 'span 2' }}>
                          <span className="mis-ferias-info-label">Horarios</span>
                          <span className="mis-ferias-info-value">{puesto.horarios || 'No especificados'}</span>
                        </div>
                        <div className="mis-ferias-info-item" style={{ gridColumn: 'span 2' }}>
                          <span className="mis-ferias-info-label">Descripción</span>
                          <p className="mis-ferias-info-value" style={{ margin: '4px 0 0', fontWeight: 400 }}>{puesto.descripcion || 'Sin descripción'}</p>
                        </div>
                        {puesto.tiposProducto && puesto.tiposProducto.length > 0 && (
                          <div className="mis-ferias-info-item" style={{ gridColumn: 'span 2' }}>
                            <span className="mis-ferias-info-label">Tipos de producto</span>
                            <div className="mis-ferias-tags">
                              {puesto.tiposProducto.map(t => (
                                <span key={t} className="mis-feria-tag">{t}</span>
                              ))}
                            </div>
                          </div>
                        )}
                        {puesto.metodosCultivo && (
                          <div className="mis-ferias-info-item" style={{ gridColumn: 'span 2' }}>
                            <span className="mis-ferias-info-label">Métodos de cultivo</span>
                            <span className="mis-ferias-info-value" style={{ fontWeight: 400 }}>{puesto.metodosCultivo}</span>
                          </div>
                        )}
                        {puesto.redesSociales && (
                          <div className="mis-ferias-info-item" style={{ gridColumn: 'span 2' }}>
                            <span className="mis-ferias-info-label">Redes sociales</span>
                            <span className="mis-ferias-info-value" style={{ fontWeight: 400 }}>{puesto.redesSociales}</span>
                          </div>
                        )}
                        {/* Fotos del puesto */}
                        {puesto.fotosBase64 && puesto.fotosBase64.length > 0 && (
                          <div className="mis-ferias-info-item" style={{ gridColumn: 'span 2' }}>
                            <span className="mis-ferias-info-label">Fotos del puesto</span>
                            <div className="mis-ferias-fotos-grid">
                              {puesto.fotosBase64.map((foto, index) => (
                                <img
                                  key={index}
                                  src={foto}
                                  alt={`Foto ${index + 1}`}
                                  className="mis-ferias-foto"
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="mis-ferias-empty">
                        <p>No se encontró información de tu puesto.</p>
                        <Link to="/registro-agricultor">Completar registro ➔</Link>
                      </div>
                    )}
                  </div>
                </div>

              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default MisFerias
