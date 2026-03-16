import React, { useState, useEffect } from 'react'
import './SidebarFilters.css'

interface Category {
  emoji: string
  name: string
  count: number
}

interface FeriaFilter {
  name: string
  defaultChecked: boolean
}

// Actualizado en base a nuestros datos de muestra estáticos
const categories: Category[] = [
  { emoji: '🍅', name: 'Verduras', count: 7 },
  { emoji: '🍎', name: 'Frutas', count: 8 },
  { emoji: '🌿', name: 'Hierbas', count: 1 },
  { emoji: '🥔', name: 'Tubérculos', count: 1 },
  { emoji: '🥚', name: 'Proteína', count: 1 },
]

const feriaFilters: FeriaFilter[] = [
  { name: 'Feria de Pavas', defaultChecked: true },
  { name: 'Feria de Cartago', defaultChecked: true },
  { name: 'Feria de Heredia', defaultChecked: true },
  { name: 'Feria de Alajuela', defaultChecked: true },
  { name: 'Feria de Desamparados', defaultChecked: false },
  { name: 'Feria de Tibás', defaultChecked: false },
]

interface SidebarFiltersProps {
  activeCategory?: string
  onCategoryChange?: (category: string) => void
  onFeriaChange?: (feria: string, checked: boolean) => void
  onInitialFerias?: (ferias: string[]) => void
  onMassFeriaChange?: (ferias: string[]) => void
}

const SidebarFilters: React.FC<SidebarFiltersProps> = ({
  activeCategory = 'Verduras',
  onCategoryChange,
  onFeriaChange,
  onInitialFerias,
  onMassFeriaChange
}) => {
  const [selected, setSelected] = useState<string>(activeCategory)
  const [checkedFerias, setCheckedFerias] = useState<Record<string, boolean>>(
    Object.fromEntries(feriaFilters.map((f) => [f.name, f.defaultChecked]))
  )

  // Pasar ferias iniciales de vuelta al componente padre al montar
  useEffect(() => {
    if (onInitialFerias) {
      const initialChecked = feriaFilters
        .filter(f => f.defaultChecked)
        .map(f => f.name);
      onInitialFerias(initialChecked);
    }
  }, [])

  // Sincronizar cambios en las props
  useEffect(() => {
    setSelected(activeCategory)
  }, [activeCategory])

  const handleCategoryClick = (name: string) => {
    setSelected(name)
    if (onCategoryChange) onCategoryChange(name)
  }

  const handleFeriaCheck = (name: string, checked: boolean) => {
    setCheckedFerias((prev) => ({ ...prev, [name]: checked }))
    if (onFeriaChange) onFeriaChange(name, checked)
  }

  const isAllChecked = feriaFilters.every(f => checkedFerias[f.name]);

  const handleToggleAll = (checked: boolean) => {
    const newCheckedState = Object.fromEntries(feriaFilters.map(f => [f.name, checked]));
    setCheckedFerias(newCheckedState);
    if (onMassFeriaChange) {
      onMassFeriaChange(checked ? feriaFilters.map(f => f.name) : []);
    }
  }

  return (
    <aside className="sidebar-filters">
      {/* Categorías */}
      <div className="sidebar-card">
        <h3 className="sidebar-card-title">Categorías</h3>
        <ul className="category-list">
          {categories.map((cat) => (
            <li
              key={cat.name}
              className={`category-item ${selected === cat.name ? 'active' : ''}`}
              onClick={() => handleCategoryClick(cat.name)}
            >
              <span>
                {cat.emoji} {cat.name}
              </span>
              <span className="category-item-badge">{cat.count}</span>
            </li>
          ))}
          <li
            className={`category-item ${selected === 'Todos' ? 'active' : ''}`}
            onClick={() => handleCategoryClick('Todos')}
          >
            <span>
              🛒 Todos
            </span>
            <span className="category-item-badge">18</span>
          </li>
        </ul>
      </div>

      {/* Filtro de ferias */}
      <div className="sidebar-card">
        <h3 className="sidebar-card-title">Filtrar por feria</h3>
        <div className="feria-filter-list">
          <label className="feria-filter-label" style={{ fontWeight: '600', paddingBottom: '0.4rem', borderBottom: '1px solid #ebebeb', marginBottom: '0.4rem' }}>
            <input
              type="checkbox"
              checked={isAllChecked}
              onChange={(e) => handleToggleAll(e.target.checked)}
              className="feria-filter-checkbox"
            />
            Todas las ferias
          </label>
          {feriaFilters.map((feria) => (
            <label key={feria.name} className="feria-filter-label">
              <input
                type="checkbox"
                checked={checkedFerias[feria.name]}
                onChange={(e) => handleFeriaCheck(feria.name, e.target.checked)}
                className="feria-filter-checkbox"
              />
              {feria.name}
            </label>
          ))}
        </div>
      </div>
    </aside>
  )
}

export default SidebarFilters
