import React from 'react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import './CartDrawer.css'

const CartDrawer: React.FC = () => {
  const { items, removeFromCart, updateQuantity, clearCart, getTotal, isCartOpen, setIsCartOpen } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  if (!isCartOpen) return null

  const handleCheckout = () => {
    setIsCartOpen(false)
    navigate('/proforma')
  }

  const handleLoginRedirect = () => {
    setIsCartOpen(false)
    navigate('/auth')
  }

  return (
    <>
      <div className="cart-drawer-overlay" onClick={() => setIsCartOpen(false)} />
      <div className="cart-drawer">
        <div className="cart-drawer-header">
          <h2>🛒 Mi Carrito</h2>
          <button className="cart-drawer-close" onClick={() => setIsCartOpen(false)}>✕</button>
        </div>

        <div className="cart-drawer-items">
          {!user ? (
            <div className="cart-empty">
              <div className="cart-empty-icon">🔒</div>
              <p>Inicio de sesión requerido</p>
              <p style={{ fontSize: '0.85rem', marginTop: '0.5rem', color: '#b0b8c4', marginBottom: '1.5rem' }}>
                Iniciá sesión para usar el carrito de compras y generar proformas.
              </p>
              <button 
                className="cart-checkout-btn" 
                onClick={handleLoginRedirect}
                style={{ width: '80%', margin: '0 auto' }}
              >
                Iniciar Sesión
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className="cart-empty">
              <div className="cart-empty-icon">🛒</div>
              <p>Tu carrito está vacío</p>
              <p style={{ fontSize: '0.85rem', marginTop: '0.5rem', color: '#b0b8c4' }}>
                Agregá productos desde la sección de comparación
              </p>
            </div>
          ) : (
            items.map((item, i) => {
              const key = `${item.id}-${item.feriaNombre}-${i}`
              return (
                <div className="cart-item" key={key}>
                  <div className="cart-item-emoji">{item.emoji}</div>
                  <div className="cart-item-info">
                    <div className="cart-item-name">{item.nombre}</div>
                    <div className="cart-item-feria">📍 {item.feriaNombre} · {item.provincia}</div>
                    <div className="cart-item-controls">
                      <button className="cart-qty-btn" onClick={() => updateQuantity(item.id, item.feriaNombre, item.cantidad - 1)}>−</button>
                      <span className="cart-qty-value">{item.cantidad}</span>
                      <button className="cart-qty-btn" onClick={() => updateQuantity(item.id, item.feriaNombre, item.cantidad + 1)}>+</button>
                      <button className="cart-item-remove" onClick={() => removeFromCart(item.id, item.feriaNombre)}>🗑️</button>
                    </div>
                  </div>
                  <div>
                    <div className="cart-item-price">₡{(item.precio * item.cantidad).toLocaleString()}</div>
                    <div className="cart-item-unit-price">₡{item.precio.toLocaleString()} / {item.unidad}</div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {items.length > 0 && (
          <div className="cart-drawer-footer">
            <div className="cart-total-row">
              <span className="cart-total-label">Total estimado</span>
              <span className="cart-total-value">₡{getTotal().toLocaleString()}</span>
            </div>
            <div className="cart-footer-actions">
              <button className="cart-checkout-btn" onClick={handleCheckout}>
                📋 Generar Proforma
              </button>
              <button className="cart-clear-btn" onClick={clearCart}>
                Vaciar carrito
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default CartDrawer
