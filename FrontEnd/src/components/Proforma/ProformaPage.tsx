import React, { useState } from 'react'
import Navbar from '../Navbar'
import Footer from '../Footer'
import { useCart, DeliveryInfo } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'
import Swal from 'sweetalert2'
import './Proforma.css'
import '../../pages/Pages.css'

const ENVIO_POR_PROVINCIA: Record<string, number> = {
  'San José': 1500,
  'Alajuela': 2000,
  'Cartago': 2000,
  'Heredia': 1800,
  'Guanacaste': 3500,
  'Puntarenas': 3500,
  'Limón': 3000,
}

const ProformaPage: React.FC = () => {
  const { items, updateQuantity, removeFromCart, getTotal, saveProforma, proformas, deleteProforma } = useCart()
  const { user } = useAuth()

  const [wantsDelivery, setWantsDelivery] = useState(false)
  const [delivery, setDelivery] = useState<DeliveryInfo>({
    nombre: '',
    telefono: '',
    direccion: '',
    provincia: 'San José',
    notas: '',
    costoEnvio: 1500,
  })

  const handleProvinciaChange = (prov: string) => {
    setDelivery(prev => ({
      ...prev,
      provincia: prov,
      costoEnvio: ENVIO_POR_PROVINCIA[prov] || 2000,
    }))
  }

  const subtotal = getTotal()
  const envio = wantsDelivery ? delivery.costoEnvio : 0
  const total = subtotal + envio

  const handleGenerate = () => {
    if (items.length === 0) return

    if (wantsDelivery) {
      if (!delivery.nombre.trim() || !delivery.telefono.trim() || !delivery.direccion.trim()) {
        Swal.fire({
          icon: 'warning',
          title: 'Datos incompletos',
          text: 'Completá los datos de delivery para generar la proforma.',
          confirmButtonColor: '#3B9C3A',
        })
        return
      }
      if (delivery.telefono.trim().length !== 8) {
        Swal.fire({
          icon: 'warning',
          title: 'Teléfono inválido',
          text: 'El número de teléfono debe tener exactamente 8 dígitos.',
          confirmButtonColor: '#3B9C3A',
        })
        return
      }
    }

    const proforma = saveProforma(wantsDelivery ? delivery : undefined)

    Swal.fire({
      icon: 'success',
      title: '¡Proforma generada!',
      html: `
        <div style="text-align:left; font-size:0.9rem;">
          <p><strong>Total:</strong> ₡${total.toLocaleString()}</p>
          <p><strong>Productos:</strong> ${items.length}</p>
          ${wantsDelivery ? `<p><strong>Delivery a:</strong> ${delivery.direccion}</p>` : ''}
        </div>
      `,
      confirmButtonColor: '#3B9C3A',
    })
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="proforma-page">
      <Navbar />
      
      {!user ? (
        <div className="content-barrier">
          <div className="barrier-icon">🔒🛒</div>
          <h1 className="barrier-title">
            Desbloqueá Tu Carrito de Compras
          </h1>
          <p className="barrier-text">
            Para agregar productos a tu carrito, comparar precios de ferias y generar tus proformas, necesitás tener una cuenta en AgroMap. ¡Es gratis y solo te tomará un minuto!
          </p>
          <div className="barrier-actions">
            <Link to="/auth" className="navbar-cta" style={{ textDecoration: 'none', padding: '1rem 2.5rem', fontSize: '1.1rem' }}>
              Registrarse ahora
            </Link>
            <Link to="/" className="action-link">
              Volver al inicio
            </Link>
          </div>
        </div>
      ) : (
        <div className="proforma-container">
          <div className="proforma-header">
            <h1>📋 Proforma / Presupuesto</h1>
            <p>Revisá tu lista de compras, ajustá cantidades y generá tu proforma</p>
          </div>

          <div className="proforma-content">
                {items.length === 0 ? (
                  <div className="proforma-empty">
                    <div className="proforma-empty-icon">📋</div>
                    <p>No tenés productos aún. Agregá desde la sección de comparación.</p>
                  </div>
                ) : (
                  items.map((item, i) => (
                    <div className="proforma-item" key={`${item.id}-${item.feriaNombre}-${i}`}>
                      <div className="proforma-item-emoji">{item.emoji}</div>
                      <div>
                        <div className="proforma-item-name">{item.nombre}</div>
                        <div className="proforma-item-feria">📍 {item.feriaNombre} · {item.provincia}</div>
                      </div>
                      <div className="proforma-item-qty">
                        <button className="proforma-qty-btn" onClick={() => updateQuantity(item.id, item.feriaNombre, item.cantidad - 1)}>−</button>
                        <span style={{ fontWeight: 800, minWidth: '1.5rem', textAlign: 'center' }}>{item.cantidad}</span>
                        <button className="proforma-qty-btn" onClick={() => updateQuantity(item.id, item.feriaNombre, item.cantidad + 1)}>+</button>
                      </div>
                      <div className="proforma-item-price">₡{(item.precio * item.cantidad).toLocaleString()}</div>
                      <button className="proforma-item-remove" onClick={() => removeFromCart(item.id, item.feriaNombre)}>🗑️</button>
                    </div>
                  ))
                )}
              </div>

              {/* Sidebar */}
              <div className="proforma-sidebar">
                <div className="proforma-summary">
                  <h3>💰 Resumen</h3>

                  <div className="proforma-summary-row">
                    <span>Subtotal ({items.length} productos)</span>
                    <span>₡{subtotal.toLocaleString()}</span>
                  </div>

                  <label className="proforma-delivery-toggle">
                    <input
                      type="checkbox"
                      checked={wantsDelivery}
                      onChange={e => setWantsDelivery(e.target.checked)}
                    />
                    <span>🚚 Agregar Delivery</span>
                  </label>

                  {wantsDelivery && (
                    <div className="proforma-delivery-fields">
                      <div className="proforma-field">
                        <label>Nombre completo</label>
                        <input
                          type="text"
                          value={delivery.nombre}
                          onChange={e => setDelivery(prev => ({ ...prev, nombre: e.target.value }))}
                          placeholder="Tu nombre"
                        />
                      </div>
                      <div className="proforma-field">
                        <label>Teléfono</label>
                        <input
                          type="tel"
                          value={delivery.telefono}
                          onChange={e => {
                            const val = e.target.value.replace(/\D/g, '').slice(0, 8);
                            setDelivery(prev => ({ ...prev, telefono: val }));
                          }}
                          placeholder="88888888"
                          maxLength={8}
                        />
                      </div>
                      <div className="proforma-field">
                        <label>Provincia de entrega</label>
                        <select
                          value={delivery.provincia}
                          onChange={e => handleProvinciaChange(e.target.value)}
                        >
                          {Object.keys(ENVIO_POR_PROVINCIA).map(p => (
                            <option key={p}>{p}</option>
                          ))}
                        </select>
                      </div>
                      <div className="proforma-field">
                        <label>Dirección de entrega</label>
                        <textarea
                          rows={2}
                          value={delivery.direccion}
                          onChange={e => setDelivery(prev => ({ ...prev, direccion: e.target.value }))}
                          placeholder="Dirección exacta..."
                        />
                      </div>
                      <div className="proforma-field">
                        <label>Notas adicionales</label>
                        <input
                          type="text"
                          value={delivery.notas}
                          onChange={e => setDelivery(prev => ({ ...prev, notas: e.target.value }))}
                          placeholder="Ej: Dejar en portería"
                        />
                      </div>
                      <div className="proforma-summary-row">
                        <span>Costo de envío ({delivery.provincia})</span>
                        <span>₡{delivery.costoEnvio.toLocaleString()}</span>
                      </div>
                    </div>
                  )}

                  <div className="proforma-summary-row total">
                    <span>Total</span>
                    <span>₡{total.toLocaleString()}</span>
                  </div>

                  <button
                    className="proforma-generate-btn"
                    onClick={handleGenerate}
                    disabled={items.length === 0}
                  >
                    📋 Generar Proforma
                  </button>

                  {items.length > 0 && (
                    <button className="proforma-print-btn" onClick={handlePrint}>
                      🖨️ Imprimir
                    </button>
                  )}
                </div>

                {/* Historial */}
                {proformas.length > 0 && (
                  <div className="proforma-history">
                    <h3>📁 Proformas Guardadas</h3>
                    {proformas.map(p => (
                      <div className="proforma-history-item" key={p.id}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div className="proforma-history-id">{p.id}</div>
                            <div className="proforma-history-date">{p.fecha}</div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span className="proforma-history-total">₡{p.total.toLocaleString()}</span>
                            <button className="proforma-history-delete" onClick={() => deleteProforma(p.id)}>🗑️</button>
                          </div>
                        </div>
                        <div style={{ marginTop: '0.4rem', fontSize: '0.75rem', color: '#94a3b8' }}>
                          {p.items.map(i => i.nombre).join(', ')}
                          {p.delivery && ` · 🚚 ${p.delivery.provincia}`}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
        </div>
      )}
      <Footer />
    </div>
  )
}

export default ProformaPage
