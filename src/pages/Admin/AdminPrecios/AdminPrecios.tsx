import React, { useEffect, useState } from 'react'
import { api } from '../../../services/api'
import AlertModal from '../../../components/admin/AlertModal/AlertModal'
import ConfirmModal from '../../../components/admin/ConfirmModal/ConfirmModal'
import './AdminPrecios.css'

const AdminPrecios = () => {
    const [prices, setPrices] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showEditModal, setShowEditModal] = useState(false)
    const [selectedPrice, setSelectedPrice] = useState<any>(null)
    const [newPriceValue, setNewPriceValue] = useState<string>('')
    const [alertConfig, setAlertConfig] = useState({ isOpen: false, message: '', title: '' })
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [priceToDelete, setPriceToDelete] = useState<any>(null)

    useEffect(() => {
        fetchPrices()
    }, [])

    const fetchPrices = async () => {
        try {
            setLoading(true)
            const [pricesData, productsData] = await Promise.all([
                api.getPrices(),
                api.getProducts()
            ])

            // Combinar datos del producto (icono, nombre, unidad) en los registros de precios
            const mergedPrices = pricesData.map((p: any) => {
                const product = productsData.find((prod: any) => prod.id === p.productId)
                return {
                    ...p,
                    productName: product?.name || 'Producto desconocido',
                    productIcon: product?.image || '📦',
                    unit: product?.unit || 'un'
                }
            })

            setPrices(mergedPrices)
        } catch (error) {
            console.error('Error fetching prices:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleEditClick = (priceItem: any) => {
        setSelectedPrice(priceItem)
        setNewPriceValue(priceItem.price.toString())
        setShowEditModal(true)
    }

    const handleUpdatePrice = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedPrice) return

        // Validación: No permitir precios vacíos o inválidos
        if (newPriceValue === '' || isNaN(Number(newPriceValue)) || Number(newPriceValue) < 0) {
            setAlertConfig({
                isOpen: true,
                title: 'Precio Inválido',
                message: 'Por favor, ingresa un precio válido mayor o igual a cero.'
            })
            return
        }

        try {
            const updatedPrice = await api.updatePrice(selectedPrice.id, { price: Number(newPriceValue) })
            setPrices(prices.map(p => p.id === selectedPrice.id ? { ...p, price: updatedPrice.price } : p))
            setShowEditModal(false)
            setSelectedPrice(null)
        } catch (error) {
            setAlertConfig({
                isOpen: true,
                title: 'Error',
                message: 'Error al actualizar el precio'
            })
        }
    }

    const handleDeleteClick = (priceItem: any) => {
        setPriceToDelete(priceItem)
        setShowDeleteConfirm(true)
    }

    const handleConfirmDelete = async () => {
        if (!priceToDelete) return

        try {
            await api.deletePrice(priceToDelete.id)
            setPrices(prices.filter(p => p.id !== priceToDelete.id))
            setShowDeleteConfirm(false)
            setPriceToDelete(null)
            setAlertConfig({
                isOpen: true,
                title: 'Éxito',
                message: 'El precio ha sido eliminado correctamente.'
            })
        } catch (error) {
            setAlertConfig({
                isOpen: true,
                title: 'Error',
                message: 'No se pudo eliminar el precio. Por favor intenta de nuevo.'
            })
        }
    }

    return (
        <div className="prices-container">
            <header className="prices-header">
                <h1>Gestión de Precios</h1>
                <button className="btn-new" onClick={() => alert('Próximamente: Vincular nuevo producto a feria')}>
                    <span>+</span> Actualizar Precios
                </button>
            </header>

            {loading ? (
                <div style={{ padding: '2rem', textAlign: 'center' }}>Cargando precios...</div>
            ) : (
                <div className="prices-grid">
                    {prices.map(item => (
                        <div className="price-card" key={item.id}>
                            <div className="price-card-header">
                                <div className="price-product-info">
                                    <span className="product-mini-icon">{item.productIcon}</span>
                                    <span className="product-mini-name">{item.productName}</span>
                                </div>
                                <span className="fair-badge">{item.fair}</span>
                            </div>

                            <div className="price-value-row">
                                <span className="currency">₡</span>
                                <span className="amount">{item.price}</span>
                                <span className="unit-label">/ {item.unit}</span>
                            </div>

                            <div className="price-actions">
                                <button
                                    className="btn-icon"
                                    title="Editar precio"
                                    onClick={() => handleEditClick(item)}
                                >
                                    ✏️
                                </button>
                                <button
                                    className="btn-icon btn-delete"
                                    title="Eliminar precio"
                                    onClick={() => handleDeleteClick(item)}
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showEditModal && selectedPrice && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>Editar Precio</h2>
                            <button className="btn-icon" onClick={() => setShowEditModal(false)}>✕</button>
                        </div>
                        <form onSubmit={handleUpdatePrice}>
                            <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                                <span style={{ fontSize: '2rem', display: 'block' }}>{selectedPrice.productIcon}</span>
                                <strong style={{ fontSize: '1.2rem' }}>{selectedPrice.productName}</strong>
                                <p style={{ color: 'var(--text-muted)' }}>{selectedPrice.fair}</p>
                            </div>

                            <div className="form-group">
                                <label>Nuevo Precio (en colones ₡)</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    autoFocus
                                    value={newPriceValue}
                                    onChange={(e) => setNewPriceValue(e.target.value)}
                                />
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn-ghost" onClick={() => setShowEditModal(false)}>Cancelar</button>
                                <button type="submit" className="btn-primary">Guardar Cambios</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <AlertModal
                isOpen={alertConfig.isOpen}
                title={alertConfig.title}
                message={alertConfig.message}
                onClose={() => setAlertConfig({ ...alertConfig, isOpen: false })}
            />

            <ConfirmModal
                isOpen={showDeleteConfirm}
                title="Confirmar Eliminación"
                message={`¿Estás seguro de que deseas eliminar el precio de ${priceToDelete?.productName} en ${priceToDelete?.fair}?`}
                onConfirm={handleConfirmDelete}
                onCancel={() => setShowDeleteConfirm(false)}
                type="danger"
            />
        </div>
    )
}

export default AdminPrecios
