import React, { useState } from 'react'
import './SearchBar.css'

interface SearchBarProps {
  placeholder?: string
  initialValue?: string
  onSearch?: (query: string) => void
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Buscar producto... ej: tomate, yuca, maíz',
  initialValue = '',
  onSearch,
}) => {
  const [query, setQuery] = useState<string>(initialValue)

  const handleSearch = () => {
    if (onSearch) onSearch(query)
  }

  return (
    <div className="search-bar-container">
      <span className="search-bar-icon">🔍</span>
      <input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        className="search-bar-input"
      />
      <button onClick={handleSearch} className="search-bar-button">
        Buscar
      </button>
    </div>
  )
}

export default SearchBar
