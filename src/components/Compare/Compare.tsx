import React, { useState } from 'react'
import Navbar from '../Navbar'
import SidebarFilters from '../SidebarFilters'
import ProductComparisonCard from '../ProductComparisonCard'
import Footer from '../Footer'
import './Compare.css'

// ----- Datos de muestra estáticos (reemplazar con llamada a API de db.json luego) -----
const allProducts = [
  {
    category: 'Frutas',
    emoji: '🥑',
    name: 'Aguacate Hass',
    description: 'Aguacate Hass importado/nacional · Por kilogramo',
    lowestPrice: '₡2387/kg',
    rows: [
      { feriaName: 'Feria de Cartago', feriaLocation: 'Cartago', price: '₡2387/kg', priceNumeric: 2387, barWidth: 75 },
      { feriaName: 'Feria de Alajuela', feriaLocation: 'Alajuela', price: '₡2390/kg', priceNumeric: 2390, barWidth: 75 },
      { feriaName: 'Feria de Pavas', feriaLocation: 'San José', price: '₡2950/kg', priceNumeric: 2950, barWidth: 90 },
    ],
  },
  {
    category: 'Frutas',
    emoji: '🥑',
    name: 'Aguacate Criollo',
    description: 'Aguacate Criollo · Por unidad',
    lowestPrice: '₡500 c/u',
    rows: [
      { feriaName: 'Feria de Pavas', feriaLocation: 'San José', price: '₡500/un', priceNumeric: 500, barWidth: 50 },
    ],
  },
  {
    category: 'Frutas',
    emoji: '🍌',
    name: 'Banano',
    description: 'Banano criollo · Por unidad',
    lowestPrice: '₡35 c/u',
    rows: [
      { feriaName: 'Feria de Pavas', feriaLocation: 'San José', price: '₡35/un', priceNumeric: 35, barWidth: 20 },
      { feriaName: 'Feria de Heredia', feriaLocation: 'Heredia', price: '₡40/un', priceNumeric: 40, barWidth: 25 },
    ],
  },
  {
    category: 'Verduras',
    emoji: '🧅',
    name: 'Cebolla seca',
    description: 'Cebolla seca amarilla/trenza · Por kilogramo',
    lowestPrice: '₡970/kg',
    rows: [
      { feriaName: 'Feria de Cartago', feriaLocation: 'Cartago', price: '₡970/kg', priceNumeric: 970, barWidth: 60 },
      { feriaName: 'Feria de Pavas', feriaLocation: 'San José', price: '₡1100/kg', priceNumeric: 1100, barWidth: 68 },
    ],
  },
  {
    category: 'Verduras',
    emoji: '🌶️',
    name: 'Chile dulce',
    description: 'Chile dulce primera · Por unidad',
    lowestPrice: '₡290 c/u',
    rows: [
      { feriaName: 'Feria de Heredia', feriaLocation: 'Heredia', price: '₡290/un', priceNumeric: 290, barWidth: 45 },
      { feriaName: 'Feria de Pavas', feriaLocation: 'San José', price: '₡341/un', priceNumeric: 341, barWidth: 50 },
    ],
  },
  {
    category: 'Verduras',
    emoji: '🥬',
    name: 'Lechuga americana',
    description: 'Lechuga americana · Por unidad',
    lowestPrice: '₡285 c/u',
    rows: [
      { feriaName: 'Feria de Alajuela', feriaLocation: 'Alajuela', price: '₡285/un', priceNumeric: 285, barWidth: 35 },
      { feriaName: 'Feria de Pavas', feriaLocation: 'San José', price: '₡323/un', priceNumeric: 323, barWidth: 40 },
    ],
  },
  {
    category: 'Tubérculos',
    emoji: '🥔',
    name: 'Papa blanca',
    description: 'Papa blanca · Por kilogramo',
    lowestPrice: '₡615/kg',
    rows: [
      { feriaName: 'Feria de Cartago', feriaLocation: 'Cartago', price: '₡615/kg', priceNumeric: 615, barWidth: 50 },
      { feriaName: 'Feria de Pavas', feriaLocation: 'San José', price: '₡900/kg', priceNumeric: 900, barWidth: 70 },
    ],
  },
  {
    category: 'Frutas',
    emoji: '🍍',
    name: 'Piña grande',
    description: 'Piña grande · Por unidad',
    lowestPrice: '₡1355 c/u',
    rows: [
      { feriaName: 'Feria de Heredia', feriaLocation: 'Heredia', price: '₡1355/un', priceNumeric: 1355, barWidth: 75 },
      { feriaName: 'Feria de Pavas', feriaLocation: 'San José', price: '₡1390/un', priceNumeric: 1390, barWidth: 80 },
    ],
  },
  {
    category: 'Frutas',
    emoji: '🍌',
    name: 'Plátano',
    description: 'Plátano · Por unidad',
    lowestPrice: '₡250 c/u',
    rows: [
      { feriaName: 'Feria de Alajuela', feriaLocation: 'Alajuela', price: '₡250/un', priceNumeric: 250, barWidth: 35 },
      { feriaName: 'Feria de Pavas', feriaLocation: 'San José', price: '₡268/un', priceNumeric: 268, barWidth: 40 },
    ],
  },
  {
    category: 'Verduras',
    emoji: '🥬',
    name: 'Repollo verde',
    description: 'Repollo verde · Por kilogramo',
    lowestPrice: '₡383/kg',
    rows: [
      { feriaName: 'Feria de Heredia', feriaLocation: 'Heredia', price: '₡383/kg', priceNumeric: 383, barWidth: 40 },
      { feriaName: 'Feria de Pavas', feriaLocation: 'San José', price: '₡425/kg', priceNumeric: 425, barWidth: 45 },
    ],
  },
  {
    category: 'Verduras',
    emoji: '🍅',
    name: 'Tomate',
    description: 'Tomate primera · Por kilogramo',
    lowestPrice: '₡795/kg',
    rows: [
      { feriaName: 'Feria de Pavas', feriaLocation: 'San José', price: '₡795/kg', priceNumeric: 795, barWidth: 55 },
      { feriaName: 'Feria de Heredia', feriaLocation: 'Heredia', price: '₡913/kg', priceNumeric: 913, barWidth: 65 },
    ],
  },
  {
    category: 'Verduras',
    emoji: '🥕',
    name: 'Zanahoria',
    description: 'Zanahoria fresca · Por kilogramo',
    lowestPrice: '₡450/kg',
    rows: [
      { feriaName: 'Feria de Cartago', feriaLocation: 'Cartago', price: '₡450/kg', priceNumeric: 450, barWidth: 40 },
      { feriaName: 'Feria de Pavas', feriaLocation: 'San José', price: '₡683/kg', priceNumeric: 683, barWidth: 60 },
    ],
  },
  {
    category: 'Proteína',
    emoji: '🥚',
    name: 'Huevos',
    description: 'Huevos frescos · Por kilogramo',
    lowestPrice: '₡1450/kg',
    rows: [
      { feriaName: 'Feria de Alajuela', feriaLocation: 'Alajuela', price: '₡1450/kg', priceNumeric: 1450, barWidth: 65 },
      { feriaName: 'Feria de Pavas', feriaLocation: 'San José', price: '₡1543/kg', priceNumeric: 1543, barWidth: 70 },
    ],
  },
  {
    category: 'Verduras',
    emoji: '🥦',
    name: 'Brócoli',
    description: 'Brócoli fresco · Por kilogramo',
    lowestPrice: '₡975/kg',
    rows: [
      { feriaName: 'Feria de Pavas', feriaLocation: 'San José', price: '₡975/kg', priceNumeric: 975, barWidth: 65 },
    ],
  },
  {
    category: 'Hierbas',
    emoji: '🌿',
    name: 'Culantro castilla',
    description: 'Culantro castilla · Por rollito',
    lowestPrice: '₡210/rollito',
    rows: [
      { feriaName: 'Feria de Pavas', feriaLocation: 'San José', price: '₡210/rollito', priceNumeric: 210, barWidth: 25 },
    ],
  },
  {
    category: 'Frutas',
    emoji: '🍋',
    name: 'Limón',
    description: 'Limón mandarino/mesino · Por unidad',
    lowestPrice: '₡140 c/u',
    rows: [
      { feriaName: 'Feria de Alajuela', feriaLocation: 'Alajuela', price: '₡140/un', priceNumeric: 140, barWidth: 14 },
      { feriaName: 'Feria de Pavas', feriaLocation: 'San José', price: '₡185/un', priceNumeric: 185, barWidth: 18 },
    ],
  },
  {
    category: 'Frutas',
    emoji: '🍓',
    name: 'Fresa',
    description: 'Fresa fresca · Por kilogramo',
    lowestPrice: '₡2815/kg',
    rows: [
      { feriaName: 'Feria de Pavas', feriaLocation: 'San José', price: '₡2815/kg', priceNumeric: 2815, barWidth: 75 },
    ],
  },
  {
    category: 'Frutas',
    emoji: '🍉',
    name: 'Sandía',
    description: 'Sandía dulce · Por kilogramo',
    lowestPrice: '₡560/kg',
    rows: [
      { feriaName: 'Feria de Pavas', feriaLocation: 'San José', price: '₡560/kg', priceNumeric: 560, barWidth: 50 },
    ],
  }
]
// -----------------------------------------------------------------------

const Compare = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProvince, setSelectedProvince] = useState('Todas las provincias')
  const [sortOrder, setSortOrder] = useState('menor')
  
  const [activeCategory, setActiveCategory] = useState<string>('Todos')
  const [activeFerias, setActiveFerias] = useState<string[]>([])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)

    if (query.trim() === '') return

    const matchingProducts = allProducts.filter(p => 
      p.name.toLowerCase().includes(query.toLowerCase())
    )

    if (matchingProducts.length > 0) {
      const currentCategoryHasMatches = matchingProducts.some(p => p.category === activeCategory)
      if (!currentCategoryHasMatches && activeCategory !== 'Todos') {
        setActiveCategory(matchingProducts[0].category)
      }
    }
  }

  // Filtrar productos por todos los criterios activos
  const filteredProducts = allProducts
    .map(product => {
      const filteredRows = product.rows.filter(row => {
        const matchesProvince = selectedProvince === 'Todas las provincias' || row.feriaLocation === selectedProvince;
        const matchesFeria = activeFerias.includes(row.feriaName);
        return matchesProvince && matchesFeria;
      });
      
      const lowestNumeric = filteredRows.length > 0 ? Math.min(...filteredRows.map(r => r.priceNumeric)) : 0;
      const activeLowestRow = filteredRows.find(r => r.priceNumeric === lowestNumeric);

      return { 
        ...product, 
        rows: filteredRows,
        lowestPrice: activeLowestRow ? activeLowestRow.price : product.lowestPrice
      };
    })
    .filter((p) => {
      if (p.rows.length === 0) return false;
      if (activeCategory !== 'Todos' && p.category !== activeCategory) return false;
      if (searchQuery !== '' && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortOrder === 'menor') {
        const minA = Math.min(...a.rows.map((r) => r.priceNumeric))
        const minB = Math.min(...b.rows.map((r) => r.priceNumeric))
        return minA - minB
      }
      if (sortOrder === 'mayor') {
        const maxA = Math.max(...a.rows.map((r) => r.priceNumeric))
        const maxB = Math.max(...b.rows.map((r) => r.priceNumeric))
        return maxB - maxA
      }
      if (sortOrder === 'az') return a.name.localeCompare(b.name)
      return 0
    })

  const resultsTitle = activeCategory === 'Todos' ? (searchQuery ? `Resultados para "${searchQuery}"` : "Todos los productos") : `Resultados en ${activeCategory}`

  return (
    <div>
      <Navbar />

      {/* Encabezado de la página */}
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

      {/* Barra de búsqueda */}
      <div className="compare-search-bar-full">
        <div className="compare-search-input-wrap">
          <span>🔍</span>
          <input
            type="text"
            placeholder="Buscar producto..."
            value={searchQuery}
            onChange={handleSearchChange}
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
        <button className="compare-search-go-btn" onClick={() => window.scrollTo({ top: 400, behavior: 'smooth' })}>Buscar y comparar</button>
      </div>

      {/* Cuadrícula principal: barra lateral + productos */}
      <div className="compare-main">
        <SidebarFilters 
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          onFeriaChange={(feria, checked) => {
            setActiveFerias(prev => 
              checked ? [...prev, feria] : prev.filter(f => f !== feria)
            )
          }}
          onInitialFerias={(ferias) => setActiveFerias(ferias)}
          onMassFeriaChange={(ferias) => setActiveFerias(ferias)}
        />

        <div>
          {/* Encabezado de productos */}
          <div className="compare-products-header">
            <div>
              <h2 className="compare-results-title">{resultsTitle}</h2>
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

          {/* Tarjetas de comparación de productos */}
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
