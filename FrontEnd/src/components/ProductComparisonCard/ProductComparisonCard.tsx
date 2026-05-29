import React from 'react'
import CategoryIcon from '../CategoryIcon/CategoryIcon'
import './ProductComparisonCard.css'
import { Producto } from '../../services/ProductService'


export interface ComparisonRow {
  feriaName: string
  feriaLocation: string
  feriaId?: number
  price: string
  priceNumeric: number
  province?: string
  ofertaProductoId?: number
  productoId?: number
  productorId?: number
  productorNombre?: string
}

export interface ProductComparisonData {
  category: string
  emoji: string
  name: string
  description: string
  unit: string
  lowestPrice: string
  rows: ComparisonRow[]
}

interface ProductComparisonCardProps {
  product: ProductComparisonData
  onSelectFeria?: (feriaId: number) => void
}

const ProductComparisonCard: React.FC<ProductComparisonCardProps> = ({ product, onSelectFeria }) => {
  // Eliminar cualquier '· Por ...' embebido en la descripción que contradiga la unidad real
  const cleanDescription = product.description
    ? product.description.replace(/\s*[·•]\s*[Pp]or\s+\w+/g, '').trim()
    : ''

  // Agrupar ofertas por feria: cada feria debe aparecer una sola vez en el card.
  // La selección entre productores de una misma feria pasa al modal.
  const feriasUnicas: ComparisonRow[] = Array.from(
    new Map(
      product.rows
        .filter(r => r.feriaId != null)
        .map(r => [r.feriaId as number, r])
    ).values()
  )

  return (
    <div className="product-comp-card">
      {/* Card header */}
      <div className="product-comp-header">
        <div>
          <div className="product-comp-name">
            {product.name}
            {product.unit && (
              <span style={{
                fontSize: '0.7rem',
                backgroundColor: 'rgba(59, 156, 58, 0.1)',
                color: '#3B9C3A',
                padding: '2px 10px',
                borderRadius: '12px',
                fontWeight: 700,
                marginLeft: '8px',
                verticalAlign: 'middle'
              }}>
                Por {product.unit}
              </span>
            )}
          </div>
          <div className="product-comp-desc">{cleanDescription}</div>
        </div>
      </div>

      {/* Lista de ferias disponibles */}
      <div className="product-comp-table">
        <div className="product-comp-table-header">
          <span>Feria disponible</span>
          <span></span>
        </div>

        {feriasUnicas.map((row) => (
          <div key={`feria-${row.feriaId}`} className="product-comp-row">
            <div>
              <div className="product-comp-feria-name">{row.feriaName}</div>
              <div className="product-comp-feria-location">📍 {row.feriaLocation}</div>
            </div>
            <div>
              {onSelectFeria && row.feriaId != null && (
                <button
                  className="product-comp-select-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectFeria(row.feriaId as number);
                  }}
                >
                  🛒 Seleccionar
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProductComparisonCard
