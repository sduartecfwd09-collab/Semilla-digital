import React, { useState, useEffect } from 'react'
import Navbar from '../Navbar'
import SidebarFilters from '../SidebarFilters'
import ProductComparisonCard from '../ProductComparisonCard'
import { ProductComparisonData, ComparisonRow } from '../ProductComparisonCard/ProductComparisonCard'
import Footer from '../Footer'
import './Compare.css'
import { ENDPOINTS } from '../../services/api.config'

interface APIProducto {
  id?: string | number
  categoria?: string
  category?: string
  emoji?: string
  nombre?: string
  name?: string
  descripcion?: string
  description?: string
  unidad?: string
  direccionPuesto?: string
  disponible?: boolean
  lowestPrice?: string
  rows?: ComparisonRow[]
  precios?: Array<{ feriaNombre?: string; provincia?: string; precio?: number }>
}

const Compare: React.FC = () => {
  const [allProducts, setAllProducts] = useState<ProductComparisonData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProvince, setSelectedProvince] = useState('Todas las provincias')
  const [sortOrder, setSortOrder] = useState('menor')
  
  const [activeCategory, setActiveCategory] = useState<string>('Todos')

  useEffect(() => {
    fetch(ENDPOINTS.productos)
      .then(res => res.json())
      .then((data: APIProducto[]) => {
        const availableData = data.filter((p) => p.disponible !== false);
        // Mapeamos los productos de la API a la estructura que espera la UI
        const mappedData: ProductComparisonData[] = availableData.map(p => {
          const prices = p.precios || [];
          const minPrice = prices.length > 0 
            ? Math.min(...prices.map((pr) => pr.precio ?? 0)) 
            : 0;

          return {
            category: p.categoria || p.category || 'Otros',
            emoji: p.emoji || '📦',
            name: p.nombre || p.name || 'Producto sin nombre',
            description: p.descripcion || p.description || '',
            unit: p.unidad || 'Unidad',
            lowestPrice: p.lowestPrice || `₡${minPrice.toLocaleString()}`,
            rows: p.rows ? p.rows : prices.map((pr) => ({
              feriaName: pr.feriaNombre || '',
              feriaLocation: `${pr.provincia || ''}${p.direccionPuesto ? ` - ${p.direccionPuesto}` : ''}`,
              province: pr.provincia || '',
              price: `₡${(pr.precio ?? 0).toLocaleString()}`,
              priceNumeric: pr.precio ?? 0,
              barWidth: 100 // El ancho se recalcula en el componente Card
            }))
          }
        });
        setAllProducts(mappedData)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error fetching products:', err)
        setLoading(false)
      })
  }, [])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)

    if (query.trim() === '') return

    // Búsqueda inteligente: si no hay resultados en la categoría actual, 
    // pero sí en otra, cambiamos de categoría automáticamente
    const matchingProducts = allProducts.filter((p: ProductComparisonData) => 
      p.name.toLowerCase().includes(query.toLowerCase())
    )

    if (matchingProducts.length > 0) {
      const currentCategoryHasMatches = matchingProducts.some((p: ProductComparisonData) => p.category === activeCategory)
      if (!currentCategoryHasMatches && activeCategory !== 'Todos') {
        const firstMatchCategory = matchingProducts[0].category
        setActiveCategory(firstMatchCategory)
      }
    }
  }

  // Filtrar productos por todos los criterios activos
  const filteredProducts = allProducts
    .map((product: ProductComparisonData) => {
      const filteredRows = product.rows.filter((row: ComparisonRow) => {
        const matchesProvince = selectedProvince === 'Todas las provincias' || row.province === selectedProvince;
        return matchesProvince;
      });
      
      const lowestNumeric = filteredRows.length > 0 ? Math.min(...filteredRows.map((r: ComparisonRow) => r.priceNumeric)) : 0;
      const activeLowestRow = filteredRows.find((r: ComparisonRow) => r.priceNumeric === lowestNumeric);

      return { 
        ...product, 
        rows: filteredRows,
        lowestPrice: activeLowestRow ? activeLowestRow.price : product.lowestPrice
      } as ProductComparisonData;
    })
    .filter((p: ProductComparisonData) => {
      if (p.rows.length === 0) return false;
      if (activeCategory !== 'Todos' && p.category !== activeCategory) return false;
      if (searchQuery !== '' && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    })
    .sort((a: ProductComparisonData, b: ProductComparisonData) => {
      if (sortOrder === 'menor') {
        const minA = Math.min(...a.rows.map((r: ComparisonRow) => r.priceNumeric))
        const minB = Math.min(...b.rows.map((r: ComparisonRow) => r.priceNumeric))
        return minA - minB
      }
      if (sortOrder === 'mayor') {
        const maxA = Math.max(...a.rows.map((r: ComparisonRow) => r.priceNumeric))
        const maxB = Math.max(...b.rows.map((r: ComparisonRow) => r.priceNumeric))
        return maxB - maxA
      }
      if (sortOrder === 'az') return a.name.localeCompare(b.name)
      return 0
    })

  const resultsTitle = activeCategory === 'Todos' ? (searchQuery ? `Resultados para "${searchQuery}"` : "Todos los productos") : `Resultados en ${activeCategory}`

  if (loading) {
    return (
      <div className="compare-loading-container">
        <p>Cargando comparador de precios...</p>
      </div>
    )
  }

  return (
    <div>
      <Navbar />

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

      <div className="compare-search-bar-full">
        <div className="compare-search-input-wrap">
          <span>🔍</span>
          <input
            type="text"
            placeholder="Buscar por nombre de producto..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="compare-input"
          />
          {searchQuery && (
            <button 
              className="clear-search-btn" 
              onClick={() => setSearchQuery('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: '#999', padding: '0 10px' }}
            >
              ✕
            </button>
          )}
        </div>
        <div className="compare-filter-wrap">
          <select
            value={selectedProvince}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedProvince(e.target.value)}
            className="compare-filter-select"
          >
            <option>Todas las provincias</option>
            <option>San José</option>
            <option>Alajuela</option>
            <option>Cartago</option>
            <option>Heredia</option>
            <option>Guanacaste</option>
            <option>Puntarenas</option>
            <option>Limón</option>
          </select>
        </div>
      </div>

      <div className="compare-main">
        <SidebarFilters 
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />

        <div className="compare-results">
          <div className="compare-products-header">
            <div>
              <h2 className="compare-results-title">{resultsTitle}</h2>
              <span className="compare-results-count">
                {filteredProducts.length} productos encontrados
              </span>
            </div>
            <select
              value={sortOrder}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSortOrder(e.target.value)}
              className="compare-sort-select"
            >
              <option value="menor">Ordenar: Menor precio</option>
              <option value="mayor">Ordenar: Mayor precio</option>
              <option value="az">Ordenar: A-Z</option>
            </select>
          </div>

          {filteredProducts.length > 0 ? (
            <div className="filtered-products-list">
              {filteredProducts.map((product: ProductComparisonData, index: number) => (
                <ProductComparisonCard key={product.name + index} product={product} />
              ))}
            </div>
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
