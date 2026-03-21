import React, { useState, useEffect } from 'react'
import './SidebarFilters.css'
import { ENDPOINTS } from '../../services/api.config'

interface Category {
  emoji: string
  name: string
  count: number
}

interface SidebarFiltersProps {
  activeCategory?: string
  onCategoryChange?: (category: string) => void
}

const SidebarFilters: React.FC<SidebarFiltersProps> = ({
  activeCategory = 'Todos',
  onCategoryChange
}) => {
  const [selected, setSelected] = useState<string>(activeCategory)
  const [totalCount, setTotalCount] = useState<number>(0)
  const [categories, setCategories] = useState<Category[]>([
    { emoji: '🍅', name: 'Verduras', count: 0 },
    { emoji: '🍎', name: 'Frutas', count: 0 },
    { emoji: '🌿', name: 'Hierbas', count: 0 },
    { emoji: '🥔', name: 'Tubérculos', count: 0 },
    { emoji: '🌾', name: 'Granos', count: 0 },
    { emoji: '🥚', name: 'Proteína', count: 0 },
  ])

  useEffect(() => {
    // Cargar productos para actualizar los conteos de categorías
    fetch(ENDPOINTS.productos)
      .then(res => res.json())
      .then((productosData: any[]) => {
        const counts: Record<string, number> = {};
        productosData.forEach((p: any) => {
          const cName = p.categoria || p.category || 'Otros';
          counts[cName] = (counts[cName] || 0) + 1;
        });

        setTotalCount(productosData.length);
        setCategories((prev) => prev.map((cat) => ({
          ...cat,
          count: counts[cat.name] || 0
        })));
      })
      .catch(err => {
        console.error('Error loading products for category counts:', err);
      });
  }, []);

  // Sincronizar cambios en las props
  useEffect(() => {
    setSelected(activeCategory)
  }, [activeCategory])

  const handleCategoryClick = (name: string) => {
    setSelected(name)
    if (onCategoryChange) onCategoryChange(name)
  }

  return (
    <aside className="sidebar-filters">
      {/* Categorías */}
      <div className="sidebar-card">
        <h3 className="sidebar-card-title">Categorías</h3>
        <ul className="category-list">
          <li
            className={`category-item ${selected === 'Todos' ? 'active' : ''}`}
            onClick={() => handleCategoryClick('Todos')}
          >
            <span>🛒 Todos</span>
            <span className="category-item-badge">{totalCount}</span>
          </li>
          {categories.map((cat) => (
            <li
              key={cat.name}
              className={`category-item ${selected === cat.name ? 'active' : ''}`}
              onClick={() => handleCategoryClick(cat.name)}
            >
              <span>{cat.emoji} {cat.name}</span>
              <span className="category-item-badge">{cat.count}</span>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  )
}

export default SidebarFilters
