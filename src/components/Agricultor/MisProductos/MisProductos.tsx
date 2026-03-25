import React, { useState, useEffect } from 'react'
import Swal from 'sweetalert2'
import { useAuth } from '../../context/AuthContext'
import Navbar from '../../Navbar/Navbar'
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

  useEffect(() => {
    fetchProductos()

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

  const handleDeleteProduct = async (id: string | number) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: "Esta acción eliminará el producto permanentemente",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#2d8a42',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    })

    if (result.isConfirmed) {
      try {
        await deleteProducto(id)
        setProductos(productos.filter((p) => p.id !== id))
        Swal.fire('¡Eliminado!', 'El producto ha sido eliminado correctamente.', 'success')
      } catch (error) {
        console.error('Error al eliminar producto:', error)
        Swal.fire('Error', 'No se pudo eliminar el producto', 'error')
      }
    }
  }

  const handleToggleDisponibilidad = async (id: string | number, disponible: boolean) => {
    try {
      await patchProducto(id, { disponible })
      setProductos(
        productos.map((p) => (p.id === id ? { ...p, disponible } : p))
      )
    } catch (error) {
      console.error('Error al actualizar disponibilidad:', error)
      Swal.fire('Error', 'No se pudo actualizar la disponibilidad', 'error')
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
      Swal.fire('Error', 'No se pudo guardar el producto', 'error')
      throw error // Re-lanzar para que el form sepa que falló
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

  return (
    <>
      <Navbar />
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
    </>
  )
}

export default MisProductos
