import React, { useMemo } from 'react';
import { useFerias } from '../../hooks/useFerias';
import './ActiveFeriasCard.css';

const daysOfWeek = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

const ActiveFeriasCard: React.FC = () => {
  const { allFerias, loading } = useFerias();
  
  const todayName = daysOfWeek[new Date().getDay()];

  // Filtrar ferias que están activas hoy o mostrar una selección interesante
  const activeToday = useMemo(() => {
    if (!allFerias.length) return [];
    
    // Buscar coincidencia exacta o contener el día (ej: "Sábados" incluye "Sábado")
    const filtered = allFerias.filter(f => 
       f.dias.toLowerCase().includes(todayName.toLowerCase()) ||
       (todayName === 'Sábado' && f.dias.toLowerCase().includes('sábados')) ||
       (todayName === 'Domingo' && f.dias.toLowerCase().includes('domingos'))
    );

    // Si no hay hoy, mostramos las próximas 3
    return (filtered.length > 0 ? filtered : allFerias).slice(0, 3);
  }, [allFerias, todayName]);

  const scrollToFerias = () => {
    const element = document.getElementById('ferias');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="active-ferias-card skeleton">
        <div className="skeleton-title"></div>
        <div className="skeleton-item"></div>
        <div className="skeleton-item"></div>
        <div className="skeleton-item"></div>
      </div>
    );
  }

  return (
    <div className="active-ferias-card">
      <div className="active-ferias-header">
        <div className="active-pulse"></div>
        <h3 className="active-ferias-title">Ferias destacadas de {todayName}</h3>
      </div>
      
      <p className="active-ferias-subtitle">
        {activeToday.length > 0 && activeToday[0].dias.toLowerCase().includes(todayName.toLowerCase()) 
          ? `Hoy hay ${activeToday.length} ferias activas en Costa Rica`
          : "¡Prepárate! Estas son las próximas ferias a visitar"}
      </p>

      <div className="active-ferias-list">
        {activeToday.map((feria) => {
          const isOpenNow = feria.dias.toLowerCase().includes(todayName.toLowerCase());
          
          return (
            <div key={feria.id} className="active-feria-item">
              <div className="active-feria-main">
                <span className="active-feria-name">{feria.nombre}</span>
                <span className={`active-feria-status ${isOpenNow ? 'open' : 'coming'}`}>
                  {isOpenNow ? 'Abierta ahora' : 'Próximamente'}
                </span>
              </div>
              <div className="active-feria-meta">
                <span className="meta-item">📍 {feria.provincia}</span>
                <span className="meta-item">🕒 {feria.horario}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="active-ferias-footer">
        <div className="tip-box">
          <span className="tip-icon">💡</span>
          <p className="tip-text">Tip: Las mejores horas para comprar son temprano en la mañana.</p>
        </div>
        <button onClick={scrollToFerias} className="see-all-btn">
          Ver todas las ferias →
        </button>
      </div>
    </div>
  );
};

export default ActiveFeriasCard;
