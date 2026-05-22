import React from 'react'
import CategoryIcon from '../CategoryIcon/CategoryIcon'
import './ProductComparisonCard.css'
import { Producto } from '../../services/ProductService'


export interface ComparisonRow {
  feriaName: string
  feriaLocation: string
  price: string
  priceNumeric: number
  barWidth: number
  barColor?: string
  province?: string
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
  onSelect?: () => void
}

const ProductComparisonCard: React.FC<ProductComparisonCardProps> = ({ product, onSelect }) => {
  // Guard: si no hay filas de precios, Math.min/max sobre array vacío retorna ±Infinity
  // y rompe el cálculo de barras y badges. Caemos a 0 en ese caso.
  const numericPrices = product.rows.map((r: ComparisonRow) => r.priceNumeric)
  const lowestPriceNumeric = numericPrices.length > 0 ? Math.min(...numericPrices) : 0
  const maxPrice = numericPrices.length > 0 ? Math.max(...numericPrices) : 0

  // Eliminar cualquier '· Por ...' embebido en la descripción que contradiga la unidad real
  const cleanDescription = product.description
    ? product.description.replace(/\s*[·•]\s*[Pp]or\s+\w+/g, '').trim()
    : ''

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
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginLeft: 'auto', flexWrap: 'wrap' }}>
          <div className="product-comp-price-summary">
            <div className="product-comp-price-label">Precio más bajo por {product.unit.toLowerCase()}</div>
            <div className="product-comp-min-price">{product.lowestPrice}</div>
          </div>
          {onSelect && (
            <button 
              className="product-comp-select-btn"
              onClick={(e) => {
                e.stopPropagation();
                onSelect();
              }}
            >
              🛒 Seleccionar
            </button>
          )}
        </div>
      </div>

      {/* Comparison table */}
      <div className="product-comp-table">
        <div className="product-comp-table-header">
          <span>Feria</span>
          <span>Precio Aproximado</span>
          <span>Diferencias</span>
          
        </div>

        {product.rows.map((row, index) => {
          const isBest = row.priceNumeric === lowestPriceNumeric
          const isExpensive = row.priceNumeric === maxPrice && !isBest
          const diff = row.priceNumeric - lowestPriceNumeric
          const barWidthPct = maxPrice > 0 ? Math.round((row.priceNumeric / maxPrice) * 100) : 0
          const barColor = isBest ? '#3B9C3A' : '#e2e8f0'

          return (
            <div key={`${row.feriaName}-${row.priceNumeric}-${index}`} className={`product-comp-row ${isBest ? 'best' : ''}`}>
              {/* Feria info */}
              <div>
                <div className="product-comp-feria-name">{row.feriaName}</div>
                <div className="product-comp-feria-location">📍 {row.feriaLocation}</div>
              </div>

              {/* Price */}
              <div className={`product-comp-price ${isBest ? 'best' : isExpensive ? 'expensive' : ''}`}>
                {row.price}
              </div>

              {/* Bar */}
              <div className="product-comp-bar-container">
                <div
                  className="product-comp-bar"
                  style={{
                    background: barColor,
                    width: `${barWidthPct}%`,
                  }}
                />
              </div>

              {/* Badge */}
              <div>
                {isBest ? (
                  <span className="product-comp-badge-best">Mejor</span>
                ) : (
                  <span className="product-comp-badge-diff">+₡{diff}</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ProductComparisonCard
