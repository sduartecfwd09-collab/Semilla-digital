import React from 'react'
import './ProductComparisonCard.css'

export interface ComparisonRow {
  feriaName: string
  feriaLocation: string
  province?: string
  price: string
  priceNumeric: number
  barWidth: number
  barColor?: string
}

export interface ProductComparisonData {
  category: string
  emoji: string
  name: string
  description: string
  unit?: string
  lowestPrice: string
  rows: ComparisonRow[]
}

interface ProductComparisonCardProps {
  product: ProductComparisonData
}

const ProductComparisonCard: React.FC<ProductComparisonCardProps> = ({ product }) => {
  const lowestPriceNumeric = Math.min(...product.rows.map((r: ComparisonRow) => r.priceNumeric))
  const maxPrice = Math.max(...product.rows.map((r: ComparisonRow) => r.priceNumeric))

  return (
    <div className="product-comp-card">
      {/* Card header */}
      <div className="product-comp-header">
        <span className="product-comp-emoji">{product.emoji}</span>
        <div>
          <div className="product-comp-name">
            {product.name}
            {product.unit && (
              <span style={{
                fontSize: '0.7rem',
                backgroundColor: '#f0f9ff',
                color: '#0369a1',
                padding: '2px 8px',
                borderRadius: '10px',
                fontWeight: 600,
                marginLeft: '8px',
                verticalAlign: 'middle'
              }}>
                Por {product.unit}
              </span>
            )}
          </div>
          <div className="product-comp-desc">{product.description}</div>
        </div>
        <div className="product-comp-price-summary">
          <div className="product-comp-price-label">Precio más bajo</div>
          <div className="product-comp-min-price">{product.lowestPrice}</div>
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
          const barWidthPct = Math.round((row.priceNumeric / maxPrice) * 100)
          const barColor = isBest ? 'var(--lima)' : isExpensive ? '#e08060' : '#f0c060'

          return (
            <div key={index} className={`product-comp-row ${isBest ? 'best' : ''}`}>
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
