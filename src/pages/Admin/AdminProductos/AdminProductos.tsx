import React, { useEffect, useState } from 'react'
import { api } from '../../../services/api'
import ConfirmModal from '../../../components/admin/ConfirmModal/ConfirmModal'
import AlertModal from '../../../components/admin/AlertModal/AlertModal'
import './AdminProductos.css'

const AdminProductos = () => {
    // Estados para gestionar los datos de los productos, carga, búsqueda y modales
    const [products, setProducts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [showModal, setShowModal] = useState(false) // Controla la visibilidad del modal de creación/edición
    const [isEditing, setIsEditing] = useState(false) // Indica si el modal está en modo edición
    const [isConfirmOpen, setIsConfirmOpen] = useState(false) // Controla la visibilidad del modal de confirmación
    const [selectedProductId, setSelectedProductId] = useState<string | null>(null) // ID del producto seleccionado para eliminar/editar
    const [alertConfig, setAlertConfig] = useState({ isOpen: false, message: '' }) // Configuración para el modal de alerta
    const [formData, setFormData] = useState({ name: '', category: 'Verduras', unit: 'kg', image: '📦' }) // Datos del formulario para crear/editar

    // Efecto para cargar los productos al montar el componente
    useEffect(() => {
        fetchProducts()
    }, [])

    // Función para obtener los productos de la API
    const fetchProducts = async () => {
        try {
            setLoading(true)
            const data = await api.getProducts()
            setProducts(data)
        } catch (error) {
            console.error('Error fetching products:', error)
            // Podrías mostrar un mensaje de error al usuario aquí
        } finally {
            setLoading(false)
        }
    }

    // Manejador para el clic en el botón de eliminar
    const handleDeleteClick = (id: string) => {
        setSelectedProductId(id)
        setIsConfirmOpen(true)
    }

    // Manejador para el clic en el botón de editar
    const handleEditClick = (product: any) => {
        setFormData({ ...product }) // Carga los datos del producto en el formulario
        setIsEditing(true)
        setShowModal(true)
    }

    // Función para confirmar la eliminación de un producto
    const handleConfirmDelete = async () => {
        if (selectedProductId) {
            try {
                await api.deleteProduct(selectedProductId)
                setProducts(products.filter(p => p.id !== selectedProductId)) // Actualiza la lista de productos
                setIsConfirmOpen(false)
                setSelectedProductId(null)
            } catch (error) {
                console.error('Error deleting product:', error)
                setAlertConfig({ isOpen: true, message: 'Error al eliminar producto' })
            }
        }
    }

    // Manejador para el envío del formulario (crear o actualizar producto)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validación: No permitir campos vacíos o que solo contengan espacios
        if (!formData.name.trim() || !formData.image.trim()) {
            setAlertConfig({
                isOpen: true,
                message: 'Por favor, ingresa un nombre y un icono válido para el producto.'
            })
            return
        }

        try {
            if (isEditing && selectedProductId) {
                // Si estamos editando, actualizamos el producto existente
                const updatedProduct = await api.updateProduct(selectedProductId, formData)
                setProducts(products.map(p => p.id === selectedProductId ? updatedProduct : p))
            } else {
                // Si no estamos editando, creamos un nuevo producto
                const newProduct = await api.createProduct(formData)
                setProducts([...products, newProduct])
            }
            closeModal() // Cierra el modal después de la operación exitosa
        } catch (error) {
            console.error(`Error al ${isEditing ? 'actualizar' : 'crear'} producto:`, error)
            setAlertConfig({ isOpen: true, message: `Error al ${isEditing ? 'actualizar' : 'crear'} producto` })
        }
    }

    // Función para cerrar el modal y resetear los estados relacionados
    const closeModal = () => {
        setShowModal(false)
        setIsEditing(false)
        setSelectedProductId(null)
        setFormData({ name: '', category: 'Verduras', unit: 'kg', image: '📦' }) // Resetea el formulario
    }

    // Filtra los productos basándose en el término de búsqueda
    const filteredProducts = products.filter(product =>
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="products-container">
            <header className="products-header">
                <h1>Gestión de Productos</h1>
                <button className="btn-new" onClick={() => setShowModal(true)}>
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
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map(product => (
                                <tr key={product.id}>
                                    <td>
                                        <div className="product-info">
                                            <div className="product-icon">{product.image}</div>
                                            <span className="product-name">{product.name}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="category-badge">{product.category}</span>
                                    </td>
                                    <td>{product.unit}</td>
                                    <td>
                                        <div className="action-buttons">
                                            <button
                                                className="btn-icon"
                                                title="Editar"
                                                onClick={() => {
                                                    setSelectedProductId(product.id)
                                                    handleEditClick(product)
                                                }}
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                className="btn-icon"
                                                title="Eliminar"
                                                onClick={() => handleDeleteClick(product.id)}
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>{isEditing ? 'Editar Producto' : 'Nuevo Producto'}</h2>
                            <button className="btn-icon" onClick={closeModal}>✕</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Nombre del Producto</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Categoría</label>
                                <select
                                    className="form-control"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                >
                                    <option value="Verduras">Verduras</option>
                                    <option value="Frutas">Frutas</option>
                                    <option value="Granos">Granos</option>
                                    <option value="Tubérculos">Tubérculos</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Unidad de Medida</label>
                                <select
                                    className="form-control"
                                    value={formData.unit}
                                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                >
                                    <option value="kg">Por kilogramo (kg)</option>
                                    <option value="un">Por unidad (un)</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Icono (Emoji)</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={formData.image}
                                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                />
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn-ghost" onClick={closeModal}>Cancelar</button>
                                <button type="submit" className="btn-primary">
                                    {isEditing ? 'Guardar Cambios' : 'Guardar Producto'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={isConfirmOpen}
                title="Eliminar Producto"
                message="¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer."
                type="danger"
                onConfirm={handleConfirmDelete}
                onCancel={() => setIsConfirmOpen(false)}
            />

            <AlertModal
                isOpen={alertConfig.isOpen}
                title="Información Faltante"
                message={alertConfig.message}
                onClose={() => setAlertConfig({ ...alertConfig, isOpen: false })}
            />
        </div>
    )
}

export default AdminProductos
