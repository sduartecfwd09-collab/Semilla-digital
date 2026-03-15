import React, { useState } from 'react'
import Navbar from '../Navbar'
import SidebarFilters from '../SidebarFilters'
import ProductComparisonCard from '../ProductComparisonCard'
import Footer from '../Footer'
import './Compare.css'

// ----- Static sample data (replace with API call to db.json later) -----
const allProducts = [
  {
    emoji: '🍅',
    name: 'Tomate',
    description: 'Tomate maduro · Por kilogramo',
    lowestPrice: '₡550/kg',
    rows: [
      { feriaName: 'Feria de Pavas', feriaLocation: 'San José', price: '₡550/kg', priceNumeric: 550, barWidth: 55 },
      { feriaName: 'Feria de Heredia', feriaLocation: 'Heredia', price: '₡700/kg', priceNumeric: 700, barWidth: 70 },
      { feriaName: 'Feria de Alajuela', feriaLocation: 'Alajuela', price: '₡850/kg', priceNumeric: 850, barWidth: 85 },
    ],
  },
  {
    emoji: '🥦',
    name: 'Brócoli',
    description: 'Brócoli fresco · Por unidad',
    lowestPrice: '₡400/un',
    rows: [
      { feriaName: 'Feria de Cartago', feriaLocation: 'Cartago', price: '₡400/un', priceNumeric: 400, barWidth: 40 },
      { feriaName: 'Feria de Pavas', feriaLocation: 'San José', price: '₡600/un', priceNumeric: 600, barWidth: 60 },
      { feriaName: 'Feria de Alajuela', feriaLocation: 'Alajuela', price: '₡750/un', priceNumeric: 750, barWidth: 75 },
    ],
  },
  {
    emoji: '🥕',
    name: 'Zanahoria',
    description: 'Zanahoria fresca · Por kilogramo',
    lowestPrice: '₡320/kg',
    rows: [
      { feriaName: 'Feria de Heredia', feriaLocation: 'Heredia', price: '₡320/kg', priceNumeric: 320, barWidth: 32 },
      { feriaName: 'Feria de Cartago', feriaLocation: 'Cartago', price: '₡480/kg', priceNumeric: 480, barWidth: 48 },
    ],
  },
]
// -----------------------------------------------------------------------

const Compare = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProvince, setSelectedProvince] = useState('Todas las provincias')
  const [sortOrder, setSortOrder] = useState('menor')

  // Filter products by search query
  const filteredProducts = allProducts
    .filter((p) =>
      searchQuery === '' || p.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortOrder === 'menor') {
        return (
          Math.min(...a.rows.map((r) => r.priceNumeric)) -
          Math.min(...b.rows.map((r) => r.priceNumeric))
        )
      }
      if (sortOrder === 'az') return a.name.localeCompare(b.name)
      return 0
    })

  return (
    <div>
      <Navbar />

      {/* Page header */}
      <div className="compare-page-header">
        <div className="compare-breadcrumb">
          Inicio ›{' '}
          <span className="compare-breadcrumb-active">Comparar Precios</span>
        </div>
        <h1 className="compare-h1">Comparar Precios</h1>
        <p className="compare-sub">
          Encontrá el mejor precio para tus productos favoritos en las ferias de tu región
        </p>
      </div>

      {/* Search bar */}
      <div className="compare-search-bar-full">
        <div className="compare-search-input-wrap">
          <span>🔍</span>
          <input
            type="text"
            placeholder="Buscar producto..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="compare-input"
          />
        </div>
        <select
          value={selectedProvince}
          onChange={(e) => setSelectedProvince(e.target.value)}
          className="compare-filter-select"
        >
          <option>Todas las provincias</option>
          <option>San José</option>
          <option>Cartago</option>
          <option>Heredia</option>
          <option>Alajuela</option>
        </select>
        <button className="compare-search-go-btn">Buscar y comparar</button>
      </div>

      {/* Main grid: sidebar + products */}
      <div className="compare-main">
        <SidebarFilters />

        <div>
          {/* Products header */}
          <div className="compare-products-header">
            <div>
              <h2 className="compare-results-title">Resultados para "verduras"</h2>
              <span className="compare-results-count">
                {filteredProducts.length} productos encontrados
              </span>
            </div>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="compare-sort-select"
            >
              <option value="menor">Ordenar: Menor precio</option>
              <option value="mayor">Ordenar: Mayor precio</option>
              <option value="az">Ordenar: A-Z</option>
            </select>
          </div>

          {/* Product comparison cards */}
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product, index) => (
              <ProductComparisonCard key={index} product={product} />
            ))
          ) : (
            <div className="compare-no-results">
              <div className="compare-no-results-icon">🔍</div>
              <p className="compare-no-results-text">
                No se encontraron productos para "{searchQuery}"
              </p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default Compare
