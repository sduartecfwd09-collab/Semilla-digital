import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import AdminSidebar from '../../adminAgricultor/AgricultorSidebar'
import AdminHeader from '../../adminAgricultor/AgricultorHeader'
import AdminProductList from '../../adminAgricultor/AgricultorProductList'
import AdminProductForm from '../../adminAgricultor/AgricultorProductForm'
import {
  getProductosByUser,
  createProducto,
  updateProducto,
  deleteProducto,
  patchProducto,
  Producto,
} from '../../../servers/ProductService'
import './MisProductos.css'

const MisProductos: React.FC = () => {
  const { user } = useAuth()
  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Producto | undefined>(undefined)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('Todas')

  useEffect(() => {
    fetchProductos()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const fetchProductos = async () => {
    if (!user) return

    try {
      setLoading(true)
      const data = await getProductosByUser(user.id)
      setProductos(data)
    } catch (error) {
      console.error('Error al cargar productos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProduct = () => {
    setEditingProduct(undefined)
    setShowForm(true)
  }

  const handleEditProduct = (producto: Producto) => {
    setEditingProduct(producto)
    setShowForm(true)
  }

  const handleDeleteProduct = async (id: number) => {
    try {
      await deleteProducto(id)
      setProductos(productos.filter((p) => p.id !== id))
    } catch (error) {
      console.error('Error al eliminar producto:', error)
      alert('Error al eliminar el producto')
    }
  }

  const handleToggleDisponibilidad = async (id: number, disponible: boolean) => {
    try {
      await patchProducto(id, { disponible })
      setProductos(
        productos.map((p) => (p.id === id ? { ...p, disponible } : p))
      )
    } catch (error) {
      console.error('Error al actualizar disponibilidad:', error)
      alert('Error al actualizar disponibilidad')
    }
  }

  const handleSubmitForm = async (producto: Producto) => {
    try {
      if (editingProduct) {
        // Actualizar producto existente
        const updated = await updateProducto(editingProduct.id!, producto)
        setProductos(productos.map((p) => (p.id === updated.id ? updated : p)))
      } else {
        // Crear nuevo producto
        const created = await createProducto(producto)
        setProductos([...productos, created])
      }
      setShowForm(false)
      setEditingProduct(undefined)
    } catch (error) {
      console.error('Error al guardar producto:', error)
      alert('Error al guardar el producto')
    }
  }

  const handleCancelForm = () => {
    setShowForm(false)
    setEditingProduct(undefined)
  }

  // Filtrar productos
  const filteredProducts = productos
    .filter((p) =>
      p.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((p) => filterCategory === 'Todas' || p.categoria === filterCategory)

  const categorias = ['Todas', ...Array.from(new Set(productos.map((p) => p.categoria)))]

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-main">
        <AdminHeader
          title="Mis Productos"
          subtitle="Administra tus productos y precios"
        />
        <div className="admin-content">
          {/* Barra de acciones */}
          <div className="mis-productos-actions">
            <div className="mis-productos-filters">
              <input
                type="text"
                placeholder="🔍 Buscar producto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mis-productos-search"
              />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="mis-productos-category-filter"
              >
                {categorias.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <button onClick={handleCreateProduct} className="mis-productos-add-btn">
              ➕ Nuevo Producto
            </button>
          </div>

          {/* Información */}
          <div className="mis-productos-info">
            <p>
              Mostrando {filteredProducts.length} de {productos.length} producto
              {productos.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Lista de productos */}
          <AdminProductList
            productos={filteredProducts}
            loading={loading}
            onEdit={handleEditProduct}
            onDelete={handleDeleteProduct}
            onToggleDisponibilidad={handleToggleDisponibilidad}
          />

          {/* Formulario modal */}
          {showForm && user && (
            <AdminProductForm
              producto={editingProduct}
              userId={user.id}
              onSubmit={handleSubmitForm}
              onCancel={handleCancelForm}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default MisProductos
