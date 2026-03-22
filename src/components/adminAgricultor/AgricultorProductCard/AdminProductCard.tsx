import React from 'react'
import { Producto } from '../../../servers/ProductService'
import './AdminProductCard.css'

// eslint-disable-next-line no-unused-vars
interface AdminProductCardProps {
  producto: Producto
  onEdit: (producto: Producto) => void
  onDelete: (id: string | number) => void
  onToggleDisponibilidad: (id: string | number, disponible: boolean) => void
}

const AdminProductCard: React.FC<AdminProductCardProps> = ({
  producto,
  onEdit,
  onDelete,
  onToggleDisponibilidad,
}) => {
  const precios = producto.precios || []
  const precioMin = precios.length > 0 ? Math.min(...precios.map((p) => p.precio)) : 0
  const precioMax = precios.length > 0 ? Math.max(...precios.map((p) => p.precio)) : 0

  return (
    <div className={`admin-product-card ${!producto.disponible ? 'inactive' : ''}`}>
      <div className="admin-product-card-header">
        <div className="admin-product-card-emoji">{producto.emoji}</div>
        <div className="admin-product-card-info">
          <h3 className="admin-product-card-name">{producto.nombre}</h3>
          <p className="admin-product-card-desc">{producto.descripcion}</p>
        </div>
        <div className="admin-product-card-status">
          <label className="admin-product-card-toggle">
            <input
              type="checkbox"
              checked={producto.disponible}
              onChange={(e) =>
                onToggleDisponibilidad(producto.id!, e.target.checked)
              }
            />
            <span className="admin-product-card-toggle-slider"></span>
          </label>
          <span className="admin-product-card-status-text">
            {producto.disponible ? 'Disponible' : 'No disponible'}
          </span>
        </div>
      </div>

      <div className="admin-product-card-body">
        <div className="admin-product-card-meta">
          <span className="admin-product-card-category">{producto.categoria}</span>
          <span style={{
            backgroundColor: '#f0f9ff',
            color: '#0369a1',
            padding: '2px 8px',
            borderRadius: '10px',
            fontSize: '0.75rem',
            fontWeight: 600
          }}>
            {producto.unidad || 'Unidad'}
          </span>
          <span className="admin-product-card-ferias">
            {precios.length} feria{precios.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="admin-product-card-prices">
          <div className="admin-product-card-price-item">
            <span className="admin-product-card-price-label">Precio mínimo:</span>
            <span className="admin-product-card-price-value">₡{precioMin.toLocaleString('es-CR')}</span>
          </div>
          <div className="admin-product-card-price-item">
            <span className="admin-product-card-price-label">Precio máximo:</span>
            <span className="admin-product-card-price-value">₡{precioMax.toLocaleString('es-CR')}</span>
          </div>
        </div>
      </div>

      <div className="admin-product-card-actions">
        <button
          onClick={() => onEdit(producto)}
          className="admin-product-card-btn admin-product-card-btn-edit"
        >
          ✏️ Editar
        </button>
        <button
          onClick={() => onDelete(producto.id!)}
          className="admin-product-card-btn admin-product-card-btn-delete"
        >
          🗑️ Eliminar
        </button>
      </div>
    </div>
  )
}

export default AdminProductCard
