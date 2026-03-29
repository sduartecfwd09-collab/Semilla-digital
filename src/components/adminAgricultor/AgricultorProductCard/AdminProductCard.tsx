/* eslint-disable no-unused-vars, @typescript-eslint/no-unused-vars */
import React from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { Producto } from '../../../servers/ProductService'
import CategoryIcon from '../../CategoryIcon/CategoryIcon'
import './AdminProductCard.css'

// eslint-disable-next-line no-unused-vars
interface AdminProductCardProps {
  producto: Producto
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onEdit: (producto: Producto) => void
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onDelete: (id: string | number) => void
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onToggleDisponibilidad: (id: string | number, disponible: boolean) => void
}

const AdminProductCard: React.FC<AdminProductCardProps> = ({
  producto,
  onEdit,
  onDelete,
  onToggleDisponibilidad,
}) => {
  return (
    <div className={`admin-product-card ${!producto.disponible ? 'inactive' : ''}`}>
      <div className="admin-product-card-header">
        <div className="admin-product-card-info">
          <h3 className="admin-product-card-name">{producto.nombre}</h3>
          <p className="admin-product-card-desc">{producto.descripcion || 'Sin descripción'}</p>
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
          <div className="admin-product-card-meta-item">
            <span className="admin-product-card-meta-label">Categoría:</span>
            <span className="admin-product-card-category">{producto.categoria}</span>
          </div>
          <div className="admin-product-card-meta-item">
            <span className="admin-product-card-meta-label">Ubicación:</span>
            <span className="admin-product-card-ferias">
              {producto.provincia || (producto.precios && producto.precios.length > 0 ? producto.precios[0].provincia : 'N/A')}
            </span>
          </div>
        </div>

        <div className="admin-product-card-prices">
          <div className="admin-product-card-price-item">
            <span className="admin-product-card-price-label">Precio registrado:</span>
            <span className="admin-product-card-price-value">
              {producto.precios && producto.precios.length > 0 
                ? `₡${producto.precios[0].precio.toLocaleString('es-CR')} / ${producto.unidad || 'Unidad'}`
                : 'Precio no definido'}
            </span>
          </div>
        </div>
      </div>

      <div className="admin-product-card-actions">
        <button
          onClick={() => onEdit(producto)}
          className="admin-product-card-btn admin-product-card-btn-edit"
        >
          <Pencil size={14} strokeWidth={2} /> Editar
        </button>
        <button
          onClick={() => onDelete(producto.id!)}
          className="admin-product-card-btn admin-product-card-btn-delete"
        >
          <Trash2 size={14} strokeWidth={2} /> Eliminar
        </button>
      </div>
    </div>
  )
}

export default AdminProductCard
