import React from 'react'
import { Producto } from '../../../servers/ProductService'
import AdminProductCard from '../../adminAgricultor/AgricultorProductCard'
import './AdminProductList.css'


interface AdminProductListProps {
  productos: Producto[]
  loading: boolean
  onEdit: (producto: Producto) => void
  onDelete: (id: string | number) => void
  onToggleDisponibilidad: (id: string | number, disponible: boolean) => void
}

const AdminProductList: React.FC<AdminProductListProps> = ({
  productos,
  loading,
  onEdit,
  onDelete,
  onToggleDisponibilidad,
}) => {
  if (loading) {
    return (
      <div className="admin-product-list-empty">
        <div className="admin-product-list-empty-icon">⏳</div>
        <p>Cargando productos...</p>
      </div>
    )
  }

  if (productos.length === 0) {
    return (
      <div className="admin-product-list-empty">
        <div className="admin-product-list-empty-icon">📦</div>
        <p>No tienes productos registrados</p>
        <span>Crea tu primer producto usando el botón de arriba</span>
      </div>
    )
  }

  return (
    <div className="admin-product-list">
      {productos.map((producto) => (
        <AdminProductCard
          key={producto.id}
          producto={producto}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleDisponibilidad={onToggleDisponibilidad}
        />
      ))}
    </div>
  )
}

export default AdminProductList
