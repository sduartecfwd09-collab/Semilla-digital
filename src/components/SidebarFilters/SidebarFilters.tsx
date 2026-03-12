import React, { useState } from 'react'
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

const categories: Category[] = [
  { emoji: '🍅', name: 'Verduras', count: 42 },
  { emoji: '🍎', name: 'Frutas', count: 38 },
  { emoji: '🌿', name: 'Hierbas', count: 15 },
  { emoji: '🥔', name: 'Tubérculos', count: 20 },
  { emoji: '🌾', name: 'Granos', count: 12 },
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
}

const SidebarFilters: React.FC<SidebarFiltersProps> = ({
  activeCategory = 'Verduras',
  onCategoryChange,
  onFeriaChange,
}) => {
  const [selected, setSelected] = useState<string>(activeCategory)
  const [checkedFerias, setCheckedFerias] = useState<Record<string, boolean>>(
    Object.fromEntries(feriaFilters.map((f) => [f.name, f.defaultChecked]))
  )

  const handleCategoryClick = (name: string) => {
    setSelected(name)
    if (onCategoryChange) onCategoryChange(name)
  }

  const handleFeriaCheck = (name: string, checked: boolean) => {
    setCheckedFerias((prev) => ({ ...prev, [name]: checked }))
    if (onFeriaChange) onFeriaChange(name, checked)
  }

  return (
    <aside className="sidebar-filters">
      {/* Categories */}
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
        </ul>
      </div>

      {/* Feria filter */}
      <div className="sidebar-card">
        <h3 className="sidebar-card-title">Filtrar por feria</h3>
        <div className="feria-filter-list">
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
