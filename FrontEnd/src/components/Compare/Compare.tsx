import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../Navbar'
import SidebarFilters from '../SidebarFilters'
import ProductComparisonCard from '../ProductComparisonCard'
import { ProductComparisonData, ComparisonRow } from '../ProductComparisonCard/ProductComparisonCard'
import ProductModal from '../ProductModal/ProductModal'
import Footer from '../Footer'
import Swal from 'sweetalert2'
import { useAuth } from '../context/AuthContext'
import './Compare.css'
import { ENDPOINTS } from '../../services/api.config'
import { normalizeProductName, getCanonicalName, findInCatalog } from '../../utils/productCatalog'

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
  const [selectedProduct, setSelectedProduct] = useState<ProductComparisonData | null>(null)
  
  const [activeCategory, setActiveCategory] = useState<string>('Todos')

  const navigate = useNavigate()
  const { user } = useAuth()

  const handleSelectProduct = (product: ProductComparisonData) => {
    if (!user) {
      Swal.fire({
        icon: 'warning',
        title: '🔒🛒 Desbloqueá Tu Carrito',
        text: 'Para agregar productos a tu carrito, comparar precios de ferias y generar tus proformas, necesitás tener una cuenta en AgroMap. ¡Es gratis y solo te tomará un minuto!',
        confirmButtonColor: '#3B9C3A',
        showCancelButton: true,
        confirmButtonText: 'Registrarse ahora',
        cancelButtonText: 'Seguir navegando',
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/auth')
        }
      })
      return
    }
    setSelectedProduct(product)
  }

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch(ENDPOINTS.productos).then(res => res.json()),
      fetch(ENDPOINTS.ferias).then(res => res.json())
    ])
      .then(([productsRes, feriasRes]: [any, any]) => {
        if (cancelled) return;
        const productsData = productsRes.success ? productsRes.data : productsRes;
        const feriasData = feriasRes.success ? feriasRes.data : feriasRes;

        // Normalizar ferias para tener nombres consistentes
        const normalizedFerias = (feriasData || []).map((f: any) => {
          const rawProv = f.direccion?.provincia?.nombre || f.provincia || f.province || "Otras";
          let provincia = rawProv;
          if (!rawProv || rawProv === 'Otras') {
            const nombreFeria = f.nombre || f.name || '';
            const PROVINCIAS_CR = ["San José", "Alajuela", "Cartago", "Heredia", "Guanacaste", "Puntarenas", "Limón"];
            const match = PROVINCIAS_CR.find(p => nombreFeria.toLowerCase().includes(p.toLowerCase()));
            if (match) provincia = match;
          }
          return {
            ...f,
            nombre: f.nombre || f.name || "Feria sin nombre",
            name: f.nombre || f.name || "Feria sin nombre", // Asegurar compatibilidad
            provincia,
            location: f.direccion?.distrito?.nombre || f.location || "Localidad no especificada"
          };
        });

        const availableData = (productsData || []).filter((p: any) => p.disponible !== false);
        
        // Mapeamos los productos de la API a la estructura que espera la UI
        const mappedData: ProductComparisonData[] = availableData.map((p: any) => {
          const prices = p.precios || [];
          const minPrice = prices.length > 0
            ? Math.min(...prices.map((pr: any) => pr.precio ?? 0))
            : 0;

          return {
            category: p.categoria || p.category || 'Otros',
            emoji: p.emoji || '📦',
            name: p.nombre || p.name || 'Producto sin nombre',
            description: p.descripcion || p.description || '',
            unit: p.unidad || 'Unidad',
            lowestPrice: p.lowestPrice || `₡${minPrice.toLocaleString()}`,
            rows: p.rows ? p.rows : prices.map((pr: any) => {
              // Buscar feria si no tiene el nombre guardado directamente en el objeto de precio
              const relatedFeria = (pr.feriaId != null) 
                ? normalizedFerias.find((f: any) => f.id != null && String(f.id) === String(pr.feriaId)) 
                : undefined;
              const feriaName = pr.feriaNombre || (relatedFeria ? relatedFeria.nombre : 'Feria Local');
              const province = pr.provincia || (relatedFeria ? relatedFeria.provincia : (p as any).provincia || '');
              
              return {
                feriaName: feriaName,
                feriaLocation: `${province}${p.direccionPuesto ? ` - ${p.direccionPuesto}` : ''}`,
                province: province,
                price: `₡${(pr.precio ?? 0).toLocaleString()}`,
                priceNumeric: pr.precio ?? 0,
                barWidth: 100 // El ancho se recalcula en el componente Card
              };
            })
          }
        });

        
        // Agrupar productos por nombre normalizado para evitar duplicados
        // (Elotes, elote, Elote → mismo grupo usando catálogo canónico)
        const groupedMap = new Map<string, ProductComparisonData>()
        mappedData.forEach(product => {
          const key = normalizeProductName(product.name)
          const canonicalName = getCanonicalName(product.name)
          const catalogEntry = findInCatalog(product.name)
          const existing = groupedMap.get(key)
          if (existing) {
            // Concatenar rows (ferias/precios) del producto duplicado
            existing.rows = [...existing.rows, ...product.rows]
            // Deduplicar rows con misma feria + ubicación + precio
            const seen = new Set<string>()
            existing.rows = existing.rows.filter(r => {
              const id = `${r.feriaName}-${r.feriaLocation}-${r.priceNumeric}`
              if (seen.has(id)) return false
              seen.add(id)
              return true
            })
            // Recalcular precio más bajo
            const minP = Math.min(...existing.rows.map(r => r.priceNumeric))
            existing.lowestPrice = `₡${minP.toLocaleString()}`
            // Llenar descripción/unidad si faltaban en el primero
            if (!existing.description && product.description) existing.description = product.description
            if (!existing.unit && product.unit) existing.unit = product.unit
            // Usar emoji del catálogo si está disponible
            if (catalogEntry) existing.emoji = catalogEntry.emoji
          } else {
            groupedMap.set(key, {
              ...product,
              name: canonicalName,
              emoji: catalogEntry ? catalogEntry.emoji : product.emoji,
              category: catalogEntry ? catalogEntry.categoria : product.category,
              rows: [...product.rows],
            })
          }
        })

        if (cancelled) return;
        setAllProducts(Array.from(groupedMap.values()))
        setLoading(false)
      })
      .catch(err => {
        if (cancelled) return;
        console.error('Error fetching products:', err)
        setLoading(false)
      })
    return () => { cancelled = true; };
  }, [])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)

    if (query.trim() === '') return

    // Búsqueda inteligente: si no hay resultados en la categoría actual, 
    // pero sí en otra, cambiamos de categoría automáticamente
    const normalizedQuery = normalizeProductName(query)
    const matchingProducts = allProducts.filter((p: ProductComparisonData) => {
      const normalizedName = normalizeProductName(p.name)
      return normalizedName.includes(normalizedQuery)
    })

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
      
      if (searchQuery !== '') {
        const normalizedQuery = normalizeProductName(searchQuery)
        const normalizedName = normalizeProductName(p.name)
        if (!normalizedName.includes(normalizedQuery)) return false
      }
      
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
                <div key={product.name + index} onClick={() => handleSelectProduct(product)} style={{ cursor: 'pointer' }}>
                  <ProductComparisonCard product={product} onSelect={() => handleSelectProduct(product)} />
                </div>
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

      {selectedProduct && (
        <ProductModal 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)} 
        />
      )}

      <Footer />
    </div>
  )
}

export default Compare
