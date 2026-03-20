import React, { useState } from 'react';
import { Provincia } from '../../types/province.types';
import FeriaItem from './FeriaItem';

interface ProvinceCardProps {
  provincia: Provincia;
}

const provinceEmojis: Record<string, string> = {
  'San José': '🏢',
  'Alajuela': '🍊',
  'Cartago': '⛰️',
  'Heredia': '🌋',
  'Guanacaste': '🌞',
  'Puntarenas': '🚢',
  'Limón': '🌴'
};

const ProvinceCard: React.FC<ProvinceCardProps> = ({ provincia }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={`province-card ${isExpanded ? 'expanded' : ''}`}>
      <div 
        className="province-card-header" 
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="province-card-main">
          <span className="province-emoji">{provinceEmojis[provincia.nombre] || '📍'}</span>
          <div className="province-card-info">
            <h3 className="province-card-name">{provincia.nombre}</h3>
            <p className="province-card-count">{provincia.cantidadFerias} ferias disponibles</p>
          </div>
        </div>
        <button className="province-expand-btn">
          {isExpanded ? '▲' : '▼'}
        </button>
      </div>

      <div className={`province-card-content ${isExpanded ? 'open' : ''}`}>
        {provincia.ferias.length > 0 ? (
          <div className="feria-list">
            {provincia.ferias.map((f) => (
              <FeriaItem key={f.id} feria={f} />
            ))}
          </div>
        ) : (
          <div className="province-empty-state">
            <p>No hay ferias registradas actualmente para esta provincia.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProvinceCard;
