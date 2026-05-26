import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import Swal from 'sweetalert2'
import { ProductComparisonData, ComparisonRow } from '../ProductComparisonCard/ProductComparisonCard'
import './ProductModal.css'

interface ProductModalProps {
  product: ProductComparisonData
  onClose: () => void
}

const ProductModal: React.FC<ProductModalProps> = ({ product, onClose }) => {
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const { user } = useAuth()
  const [addedIndex, setAddedIndex] = useState<number | null>(null)
  const [deliveryToggle, setDeliveryToggle] = useState<Record<number, boolean>>({})
  const [quantities, setQuantities] = useState<Record<number, number>>({})

  // Si rows está vacío, evitamos Math.min(...[]) que retorna Infinity y rompe la UI.
  const priceList = product.rows.map(r => r.priceNumeric)
  const lowestPrice = priceList.length > 0 ? Math.min(...priceList) : 0

  const getQuantity = (index: number) => quantities[index] || 1

  const handleQuantityChange = (index: number, val: number) => {
    if (val < 1) return
    setQuantities(prev => ({ ...prev, [index]: val }))
  }

  const handleAddToCart = (row: ComparisonRow, index: number) => {
    if (!user) {
      Swal.fire({
        icon: 'warning',
        title: '🔒🛒 Desbloqueá Tu Carrito',
        text: 'Para agregar productos a tu carrito, comparar precios de ferias y generar tus proformas, necesitás tener una cuenta en AgroMap. ¡Es gratis y solo te tomará un minuto!',
        confirmButtonColor: '#3B9C3A',
        showCancelButton: true,
        confirmButtonText: 'Registrarse ahora',
        cancelButtonText: 'Seguir navegando',
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/auth')
        }
      })
      return
    }
    const hasDelivery = deliveryToggle[index] || false
    const qty = getQuantity(index)
    addToCart({
      id: `${product.name}-${row.feriaName}`,
      nombre: product.name,
      emoji: product.emoji,
      precio: row.priceNumeric + (hasDelivery ? 1500 : 0),
      feriaNombre: row.feriaName,
      provincia: row.province || '',
      unidad: product.unit || 'Unidad',
      descripcion: hasDelivery ? `${product.description || ''} (Incluye Delivery)` : product.description,
      categoria: product.category,
      producto_id: row.productoId,
      oferta_producto_id: row.ofertaProductoId,
      productor_id: row.productorId,
    }, qty)
    setAddedIndex(index)
    setTimeout(() => setAddedIndex(null), 1500)
  }

  const toggleDelivery = (index: number) => {
    setDeliveryToggle(prev => ({...prev, [index]: !prev[index]}))
  }

  return (
    <div className="product-modal-overlay" onClick={onClose}>
      <div className="product-modal" onClick={e => e.stopPropagation()}>
        <div className="product-modal-hero">
          <button className="product-modal-close" onClick={onClose}>✕</button>
          <div className="product-modal-emoji">{product.emoji}</div>
          <span className="product-modal-category">{product.category}</span>
          <h2 className="product-modal-title">{product.name}</h2>
          {product.description && (
            <p className="product-modal-desc">{product.description}</p>
          )}
        </div>

        <div className="product-modal-body">
          <h3 className="product-modal-section-title">📊 Precios por Feria</h3>
          <div className="product-modal-prices">
            {[...product.rows]
              .sort((a, b) => a.priceNumeric - b.priceNumeric)
              .map((row, index) => {
                const isBest = row.priceNumeric === lowestPrice
                const isDeliveryOn = deliveryToggle[index] || false
                return (
                  <div key={`${row.feriaName}-${row.priceNumeric}-${index}`} className={`product-modal-price-row ${isBest ? 'best' : ''}`}>
                    <div>
                      <div className="product-modal-price-feria">
                        {row.feriaName}
                        {isBest && <span className="product-modal-price-best-badge">Mejor precio</span>}
                      </div>
                      <div className="product-modal-price-location">📍 {row.feriaLocation}</div>
                      <div className="delivery-toggle-container">
                        <label className="delivery-toggle-label">
                          <input 
                            type="checkbox" 
                            checked={isDeliveryOn} 
                            onChange={() => toggleDelivery(index)}
                            className="delivery-toggle-input"
                          />
                          <span className="delivery-toggle-slider"></span>
                          Añadir delivery (+₡1500)
                        </label>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <span className="product-modal-price-value">₡{(row.priceNumeric + (isDeliveryOn ? 1500 : 0)).toLocaleString()}</span>
                      
                      {/* Selector de cantidad dependiente de la unidad de medida */}
                      <div className="product-modal-qty-selector">
                        <button 
                          className="product-modal-qty-btn"
                          onClick={() => handleQuantityChange(index, getQuantity(index) - 1)}
                        >
                          -
                        </button>
                        <span className="product-modal-qty-value">
                          {getQuantity(index)}
                        </span>
                        <button 
                          className="product-modal-qty-btn"
                          onClick={() => handleQuantityChange(index, getQuantity(index) + 1)}
                        >
                          +
                        </button>
                        <span className="product-modal-qty-unit">
                          {product.unit || 'ud'}
                        </span>
                      </div>
                      <button
                        className={`product-modal-add-btn ${addedIndex === index ? 'added' : ''}`}
                        style={{ width: 'auto', padding: '0.5rem 1rem', fontSize: '0.8rem', minHeight: '56px' }}
                        onClick={() => handleAddToCart(row, index)}
                      >
                        {addedIndex === index ? '✓ Agregado' : '🛒 Agregar'}
                      </button>
                    </div>
                  </div>
                )
              })}
          </div>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            <div style={{ flex: 1, minWidth: '8rem', background: '#f0fdf4', borderRadius: '0.75rem', padding: '1rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, marginBottom: '0.25rem' }}>Mejor precio</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#3B9C3A' }}>₡{lowestPrice.toLocaleString()}</div>
            </div>
            <div style={{ flex: 1, minWidth: '8rem', background: '#fafbfc', borderRadius: '0.75rem', padding: '1rem', textAlign: 'center', border: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, marginBottom: '0.25rem' }}>Ferias disponibles</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1e293b' }}>{product.rows.length}</div>
            </div>
            <div style={{ flex: 1, minWidth: '8rem', background: '#fafbfc', borderRadius: '0.75rem', padding: '1rem', textAlign: 'center', border: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, marginBottom: '0.25rem' }}>Unidad</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1e293b' }}>{product.unit}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductModal
