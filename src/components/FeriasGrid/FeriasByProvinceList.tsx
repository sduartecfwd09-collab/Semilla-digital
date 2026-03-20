import React from 'react';
import ProvinceCard from './ProvinceCard';
import { useGroupedFerias } from '../../hooks/useGroupedFerias';
import './FeriasByProvinceList.css';

const FeriasByProvinceList: React.FC = () => {
  const { groupedFeriasByProvince, loading, error } = useGroupedFerias();

  if (error) {
    return (
      <div className="error-message">
        <p>⚠️ {error}</p>
        <button onClick={() => window.location.reload()}>Reintentar</button>
      </div>
    );
  }

  return (
    <section id="ferias" className="ferias-by-province-section">
      <div className="ferias-header">
        <span className="ferias-label">Ferias del Agricultor</span>
        <h2 className="ferias-title">Explorá las ferias de cada provincia</h2>
        <p className="ferias-description">
          Utilizamos Google Maps para brindarte direcciones precisas y enriquecemos la 
          información con nuestra base de datos local para horarios y días.
        </p>
      </div>

      <div className="provinces-grid">
        {loading ? (
          // Skeleton loaders can be implemented here later
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Conectando con Google Maps y fuentes locales...</p>
          </div>
        ) : (
          groupedFeriasByProvince.map((provincia) => (
            <ProvinceCard key={provincia.nombre} provincia={provincia} />
          ))
        )}
      </div>
    </section>
  );
};

export default FeriasByProvinceList;
