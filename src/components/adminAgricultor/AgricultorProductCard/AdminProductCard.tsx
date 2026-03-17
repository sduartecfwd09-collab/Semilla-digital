import React from 'react'
import { Producto } from '../../../servers/ProductService'
import './AdminProductCard.css'

interface AdminProductCardProps {
  producto: Producto
  onEdit: (producto: Producto) => void
  onDelete: (id: number) => void
  onToggleDisponibilidad: (id: number, disponible: boolean) => void
}

const AdminProductCard: React.FC<AdminProductCardProps> = ({
  producto,
  onEdit,
  onDelete,
  onToggleDisponibilidad,
}) => {
  const precioMin = Math.min(...producto.precios.map((p) => p.precio))
  const precioMax = Math.max(...producto.precios.map((p) => p.precio))

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
          <span className="admin-product-card-ferias">
            {producto.precios.length} feria{producto.precios.length !== 1 ? 's' : ''}
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
          onClick={() => {
            if (window.confirm('¿Estás seguro de eliminar este producto?')) {
              onDelete(producto.id!)
            }
          }}
          className="admin-product-card-btn admin-product-card-btn-delete"
        >
          🗑️ Eliminar
        </button>
      </div>
    </div>
  )
}

export default AdminProductCard
