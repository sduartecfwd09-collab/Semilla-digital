import React from 'react'
import { Link } from 'react-router-dom'
import SearchBar from '../SearchBar'
import ProductMiniList from '../ProductMiniList'
import './HeroSection.css'

const HeroSection: React.FC = () => {
  return (
    <section className="hero-section">
      {/* Decorative radial glow */}
      <div className="hero-glow" />

      {/* Left column – text */}
      <div>
        <div className="hero-tag">🌿 Ferias del Agricultor · Costa Rica</div>
        <h1 className="hero-title">
          Compará precios,{' '}
          <em>comprá mejor.</em>
        </h1>
        <p className="hero-description">
          Consultá y comparé los precios de frutas, verduras y más en las diferentes
          ferias del agricultor de tu región antes de salir de casa.
        </p>
        <div className="hero-buttons">
          <Link to="/comparar" className="hero-btn-primary">
            Explorar productos
          </Link>
          <a href="#ferias" className="hero-btn-secondary">
            <span>→</span>
            Ver ferias cercanas
          </a>
        </div>
      </div>

      {/* Right column – search card */}
      <div className="hero-search-card">
        <SearchBar />
        <ProductMiniList />
      </div>
    </section>
  )
}

export default HeroSection
