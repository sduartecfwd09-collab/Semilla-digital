import React, { useEffect, useState } from 'react'
import { api } from '../../../services/api'
import Swal from 'sweetalert2'
import './AdminPrecios.css'
import { Price } from '../../../types'

interface MergedPrice extends Price {
    productName?: string
    productIcon?: string
    unit?: string
}

const AdminPrecios = () => {
    const [prices, setPrices] = useState<MergedPrice[]>([])
    const [loading, setLoading] = useState(true)
    const [showEditModal, setShowEditModal] = useState(false)
    const [selectedPrice, setSelectedPrice] = useState<MergedPrice | null>(null)
    const [newPriceValue, setNewPriceValue] = useState<string>('')

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
                const product = productsData.find((prod: any) => prod.id === p.productId) as any
                return {
                    ...p,
                    productName: product?.nombre || 'Producto desconocido',
                    productIcon: product?.emoji || '📦',
                    unit: 'unidad'
                }
            })

            setPrices(mergedPrices)
        } catch (error) {
            console.error('Error fetching prices:', error)
            Swal.fire('Error', 'No se pudieron cargar los precios.', 'error')
        } finally {
            setLoading(false)
        }
    }

    const handleEditClick = (priceItem: MergedPrice) => {
        setSelectedPrice(priceItem)
        setNewPriceValue(priceItem.price.toString())
        setShowEditModal(true)
    }

    const handleUpdatePrice = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedPrice) return

        if (newPriceValue === '' || isNaN(Number(newPriceValue)) || Number(newPriceValue) < 0) {
            Swal.fire('Precio Inválido', 'Ingresa un precio válido mayor o igual a cero.', 'warning')
            return
        }

        try {
            const updatedPrice = await api.updatePrice(selectedPrice.id, { price: Number(newPriceValue) })
            setPrices(prices.map(p => p.id === selectedPrice.id ? { ...p, price: updatedPrice.price } : p))
            setShowEditModal(false)
            setSelectedPrice(null)
            Swal.fire('Éxito', 'Precio actualizado correctamente.', 'success')
        } catch (error) {
            Swal.fire('Error', 'Error al actualizar el precio', 'error')
        }
    }

    const handleDeleteClick = async (priceItem: any) => {
        const result = await Swal.fire({
            title: 'Confirmar Eliminación',
            text: `¿Estás seguro de que deseas eliminar el precio de ${priceItem.productName} en ${priceItem.fair}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#718096',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                await api.deletePrice(priceItem.id)
                setPrices(prices.filter(p => p.id !== priceItem.id))
                Swal.fire('Éxito', 'El precio ha sido eliminado correctamente.', 'success')
            } catch (error) {
                Swal.fire('Error', 'No se pudo eliminar el precio. Intenta de nuevo.', 'error')
            }
        }
    }

    return (
        <div className="prices-container">
            <header className="prices-header">
                <h1>Gestión de Precios</h1>
                <button className="btn-new" onClick={() => Swal.fire('Información', 'Próximamente: Vincular nuevo producto a feria', 'info')}>
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
        </div>
    )
}

export default AdminPrecios
