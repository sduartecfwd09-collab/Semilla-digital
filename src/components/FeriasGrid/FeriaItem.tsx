import React from 'react';
import Swal from 'sweetalert2';
import { Feria } from '../../types/feria.types';

interface FeriaItemProps {
  feria: Feria;
}

const FeriaItem: React.FC<FeriaItemProps> = ({ feria }) => {
  const handleShowMap = () => {
    const encodedAddress = encodeURIComponent(`${feria.nombre}, ${feria.direccion}, ${feria.provincia}, Costa Rica`);
    const mapUrl = `https://maps.google.com/maps?q=${encodedAddress}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

    Swal.fire({
      title: feria.nombre,
      html: `
        <div class="map-modal-container">
          <p class="map-modal-address">📍 ${feria.direccion}</p>
          <iframe 
            width="100%" 
            height="350" 
            frameborder="0" 
            scrolling="no" 
            marginheight="0" 
            marginwidth="0" 
            src="${mapUrl}"
            style="border:0; border-radius: 12px; margin-top: 15px;"
            allowfullscreen
          ></iframe>
        </div>
      `,
      showCloseButton: true,
      showConfirmButton: false,
      width: '600px',
      padding: '2rem',
      customClass: {
        container: 'swal2-map-container',
        popup: 'swal2-map-popup',
        title: 'swal2-map-title'
      }
    });
  };

  return (
    <div className="feria-item" onClick={handleShowMap} style={{ cursor: 'pointer' }}>
      <div className="feria-item-header">
        <h4 className="feria-item-name">{feria.nombre}</h4>
        <span className={`feria-item-source-badge ${feria.source}`}>
          {feria.source === 'google' ? 'Google Maps' : feria.source === 'merged' ? 'Datos Verificados' : 'Local'}
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
