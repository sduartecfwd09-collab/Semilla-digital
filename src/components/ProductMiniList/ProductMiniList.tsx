import React from 'react'
import './ProductMiniList.css'

interface ProductMiniItem {
  emoji: string
  name: string
  lowPrice: string
  highPrice: string
}

const defaultProducts: ProductMiniItem[] = [
  { emoji: '🍅', name: 'Tomate cherry', lowPrice: '₡600/kg', highPrice: '₡950/kg' },
  { emoji: '🥦', name: 'Brócoli', lowPrice: '₡450/un', highPrice: '₡700/un' },
  { emoji: '🌽', name: 'Maíz tierno', lowPrice: '₡300/un', highPrice: '₡500/un' },
  { emoji: '🥕', name: 'Zanahoria', lowPrice: '₡350/kg', highPrice: '₡580/kg' },
]

interface ProductMiniListProps {
  products?: ProductMiniItem[]
}

const ProductMiniList: React.FC<ProductMiniListProps> = ({
  products = defaultProducts,
}) => {
  return (
    <div className="product-mini-list">
      {products.map((product, index) => (
        <div key={index} className="product-mini-item">
          <div className="product-mini-name">
            <span className="product-mini-emoji">{product.emoji}</span>
            {product.name}
          </div>
          <div className="product-mini-prices">
            <span className="product-mini-price-low">{product.lowPrice}</span>
            <span className="product-mini-price-high">{product.highPrice}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

export default ProductMiniList
