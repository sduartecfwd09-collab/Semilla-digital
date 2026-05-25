import React from 'react';
import Swal from 'sweetalert2';
import { Feria } from '../../types/feria.types';
import { escapeHtml } from '../../utils/escapeHtml';

interface FeriaItemProps {
  feria: Feria;
}

const FeriaItem: React.FC<FeriaItemProps> = ({ feria }) => {
  const handleShowMap = () => {
    const query = `${feria.nombre}, ${feria.direccion}, ${feria.provincia}, Costa Rica`;
    const encodedAddress = encodeURIComponent(query);
    const directUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
    const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`;

    const safeName = escapeHtml(feria.nombre);
    const safeAddress = escapeHtml(`${feria.direccion}, ${feria.provincia}`);
    // Las URLs ya van por encodeURIComponent y se escapan también por seguridad
    const safeDirect = escapeHtml(directUrl);
    const safeDirections = escapeHtml(directionsUrl);

    Swal.fire({
      title: `<span style="color: #166534; font-family: 'Inter', sans-serif;">${safeName}</span>`,
      html: `
        <div class="map-modal-container" style="text-align: left; padding: 10px;">
          <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 16px; border-radius: 12px; margin-bottom: 24px; box-shadow: inset 0 2px 4px 0 rgb(0 0 0 / 0.05);">
            <p style="margin: 0; font-weight: 700; color: #166534; font-size: 1rem; display: flex; align-items: center; gap: 8px;">
              📍 Ubicación exacta
            </p>
            <p style="margin: 8px 0 0 0; color: #374151; font-size: 0.95rem; line-height: 1.5;">${safeAddress}</p>
          </div>

          <div style="display: flex; flex-direction: column; gap: 14px; margin-top: 20px;">
            <a href="${safeDirect}" target="_blank" rel="noopener noreferrer"
               style="display: flex; align-items: center; justify-content: center; gap: 10px; padding: 18px; background-color: #2563eb; color: white; border-radius: 14px; text-decoration: none; font-weight: 700; font-size: 1.05rem; box-shadow: 0 10px 15px -3px rgb(37 99 235 / 0.2), 0 4px 6px -4px rgb(37 99 235 / 0.2);">
              🗺️ Ver en Google Maps
            </a>

            <a href="${safeDirections}" target="_blank" rel="noopener noreferrer"
               style="display: flex; align-items: center; justify-content: center; gap: 10px; padding: 16px; background-color: #ffffff; color: #374151; border-radius: 14px; text-decoration: none; font-weight: 600; font-size: 0.95rem; border: 2px solid #e5e7eb;">
              🚗 ¿Cómo llegar ahora?
            </a>
          </div>
        </div>
      `,
      showCloseButton: true,
      showConfirmButton: false,
      width: '480px',
      padding: '1.5rem',
      customClass: {
        container: 'swal2-map-container',
        popup: 'swal2-map-popup',
        title: 'swal2-map-title'
      }
    });
  };

  const directUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${feria.nombre}, ${feria.direccion}, ${feria.provincia}, Costa Rica`)}`;

  return (
    <div className="feria-item" onClick={handleShowMap} style={{ cursor: 'pointer' }}>
      <div className="feria-item-header">
        <h4 className="feria-item-name">{feria.nombre}</h4>
        <span className={`feria-item-source-badge ${feria.source}`}>
          {feria.source === 'google' ? (
            <a href={directUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} style={{ color: 'inherit', textDecoration: 'none' }}>
              Google Maps ↗
            </a>
          ) : feria.source === 'merged' ? 'Datos Verificados' : 'Local'}
        </span>
      </div>
      
      <div className="feria-item-details">
        <div className="feria-item-detail">
          <span className="feria-item-icon">📍</span>
          <p className="feria-item-text">{feria.direccion}</p>
        </div>
        
        <div className="feria-item-row">
          <div className="feria-item-detail">
            <span className="feria-item-icon">📅</span>
            <p className="feria-item-text">{feria.dias}</p>
          </div>
          <div className="feria-item-detail">
            <span className="feria-item-icon">⏰</span>
            <p className="feria-item-text">{feria.horario}</p>
          </div>
        </div>

        <button className="feria-item-map-btn" onClick={(e) => {
          e.stopPropagation();
          handleShowMap();
        }}>
          Ver ubicación exacta
        </button>
      </div>
    </div>
  );
};

export default FeriaItem;
