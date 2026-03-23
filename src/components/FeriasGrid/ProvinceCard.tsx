import React, { useState } from 'react';
import { Building2, Trees, Mountain, Sun, Ship, Palmtree, MapPin } from 'lucide-react';
import { Provincia } from '../../types/province.types';
import FeriaItem from './FeriaItem';

interface ProvinceCardProps {
  provincia: Provincia;
}

const provinceIconMap: Record<string, { icon: React.ReactNode; color: string }> = {
  'San José':    { icon: <Building2 size={22} strokeWidth={1.8} />, color: '#5c6bc0' },
  'Alajuela':    { icon: <Sun       size={22} strokeWidth={1.8} />, color: '#ef6c00' },
  'Cartago':     { icon: <Mountain  size={22} strokeWidth={1.8} />, color: '#546e7a' },
  'Heredia':     { icon: <Trees     size={22} strokeWidth={1.8} />, color: '#2e7d32' },
  'Guanacaste':  { icon: <Sun       size={22} strokeWidth={1.8} />, color: '#f9a825' },
  'Puntarenas':  { icon: <Ship      size={22} strokeWidth={1.8} />, color: '#0277bd' },
  'Limón':       { icon: <Palmtree  size={22} strokeWidth={1.8} />, color: '#00695c' },
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
          <span
            className="province-emoji"
            style={{ color: provinceIconMap[provincia.nombre]?.color ?? '#888' }}
          >
            {provinceIconMap[provincia.nombre]?.icon ?? <MapPin size={22} strokeWidth={1.8} />}
          </span>
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
