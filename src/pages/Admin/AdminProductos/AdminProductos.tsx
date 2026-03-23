import React, { useEffect, useState } from 'react'
import Swal from 'sweetalert2'
import { useAuth } from '../../../components/context/AuthContext'
import AdminProductForm from '../../../components/adminAgricultor/AgricultorProductForm'
import {
  Producto,
  createProducto,
  updateProducto,
  deleteProducto,
} from '../../../servers/ProductService'
import { API_BASE_URL } from '../../../services/api.config'
import './AdminProductos.css'

const AdminProductos = () => {
    const { user } = useAuth()
    const [products, setProducts] = useState<Producto[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [showForm, setShowForm] = useState(false)
    const [editingProduct, setEditingProduct] = useState<Producto | undefined>(undefined)

    useEffect(() => {
        fetchProducts()
    }, [])

    // Obtener TODOS los productos (sin filtrar por usuario, ya que es admin)
    const fetchProducts = async () => {
        try {
            setLoading(true)
            const res = await fetch(`${API_BASE_URL}/productos`)
            const data = await res.json()
            setProducts(data)
        } catch (error) {
            console.error('Error fetching products:', error)
            Swal.fire('Error', 'No se pudieron cargar los productos.', 'error')
        } finally {
            setLoading(false)
        }
    }

    const handleCreateProduct = () => {
        setEditingProduct(undefined)
        setShowForm(true)
    }

    const handleEditClick = (product: Producto) => {
        setEditingProduct(product)
        setShowForm(true)
    }

    const handleDeleteClick = async (id: string | number) => {
        const result = await Swal.fire({
            title: '¿Eliminar Producto?',
            text: "Esta acción borrará el producto permanentemente de la base de datos.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#718096',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        })

        if (result.isConfirmed) {
            try {
                await deleteProducto(id)
                setProducts(prev => prev.filter(p => p.id !== id))
                Swal.fire('Eliminado', 'Producto borrado con éxito.', 'success')
            } catch (error) {
                console.error('Error deleting product:', error)
                Swal.fire('Error', 'No se pudo eliminar el producto.', 'error')
            }
        }
    }

    const handleSubmitForm = async (producto: Producto) => {
        try {
            if (editingProduct) {
                const updated = await updateProducto(editingProduct.id!, producto)
                setProducts(products.map((p) => (p.id === updated.id ? updated : p)))
            } else {
                const created = await createProducto(producto)
                setProducts([...products, created])
            }
            setShowForm(false)
            setEditingProduct(undefined)
        } catch (error) {
            console.error('Error al guardar producto:', error)
            Swal.fire('Error', 'No se pudo guardar el producto', 'error')
            throw error
        }
    }

    const handleCancelForm = () => {
        setShowForm(false)
        setEditingProduct(undefined)
    }

    // Filtra los productos basándose en el término de búsqueda
    const filteredProducts = products.filter(product =>
        product.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.categoria?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Función auxiliar para mostrar la unidad de forma legible
    const getUnidadLabel = (unidad?: string) => {
        switch (unidad) {
            case 'Kilogramo': return 'kg'
            case 'Docena': return 'doc'
            case 'Mano': return 'mano'
            case 'Caja': return 'cj'
            case 'Unidad': return 'un'
            default: return unidad || 'un'
        }
    }

    return (
        <div className="products-container">
            <header className="products-header">
                <h1>Gestión de Productos</h1>
                <button className="btn-new" onClick={handleCreateProduct}>
                    <span>+</span> Nuevo Producto
                </button>
            </header>

            <div className="products-actions">
                <input
                    type="text"
                    placeholder="Buscar productos..."
                    className="search-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="table-wrapper">
                {loading ? (
                    <div style={{ padding: '2rem', textAlign: 'center' }}>Cargando productos...</div>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Producto</th>
                                <th>Categoría</th>
                                <th>Unidad</th>
                                <th>Precio</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map(product => {
                                const precios = product.precios || []
                                const precioDisplay = precios.length > 0
                                    ? `₡${precios[0].precio.toLocaleString('es-CR')}`
                                    : '—'

                                return (
                                    <tr key={product.id}>
                                        <td>
                                            <div className="product-info">
                                                <div className="product-icon">{product.emoji}</div>
                                                <span className="product-name">{product.nombre}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="category-badge">{product.categoria}</span>
                                        </td>
                                        <td>
                                            <span style={{
                                                backgroundColor: '#f0f9ff',
                                                color: '#0369a1',
                                                padding: '3px 10px',
                                                borderRadius: '12px',
                                                fontSize: '0.8rem',
                                                fontWeight: 600
                                            }}>
                                                Por {product.unidad || 'Unidad'} ({getUnidadLabel(product.unidad)})
                                            </span>
                                        </td>
                                        <td>
                                            <span style={{ fontWeight: 600, color: '#166534' }}>
                                                {precioDisplay}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    className="btn-text"
                                                    title="Editar"
                                                    onClick={() => handleEditClick(product)}
                                                    style={{ backgroundColor: '#eff6ff', color: '#3b82f6', border: '1px solid #bfdbfe', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}
                                                >
                                                    Editar
                                                </button>
                                                <button
                                                    className="btn-text"
                                                    title="Eliminar"
                                                    onClick={() => handleDeleteClick(product.id!)}
                                                    style={{ backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}
                                                >
                                                    Eliminar
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Formulario modal - mismo que el del agricultor */}
            {showForm && (
                <AdminProductForm
                    producto={editingProduct}
                    userId={user?.id || 'admin'}
                    onSubmit={handleSubmitForm}
                    onCancel={handleCancelForm}
                />
            )}
        </div>
    )
}

export default AdminProductos
