import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Feria } from '../../types/feria.types';
import { geocodeFeria } from '../../services/geocodingService';

// Fix for Leaflet default icon issues in React
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

interface LeafletMapProps {
  feria: Feria;
}

// Component to handle map centering
const ChangeView = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  map.setView(center, 15);
  return null;
};

const LeafletMap: React.FC<LeafletMapProps> = ({ feria }) => {
  const [coords, setCoords] = useState<[number, number] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getCoords = async () => {
      setLoading(true);
      const result = await geocodeFeria(feria);
      if (result) {
        setCoords([result.lat, result.lng]);
      }
      setLoading(false);
    };

    getCoords();
  }, [feria]);

  if (loading) {
    return <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', borderRadius: '12px' }}>
      Cargando mapa...
    </div>;
  }

  if (!coords) {
    return <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fef2f2', borderRadius: '12px', color: '#991b1b', textAlign: 'center', padding: '20px' }}>
      No se pudo cargar la ubicación exacta para esta feria.
    </div>;
  }

  return (
    <div style={{ height: '300px', width: '100%', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
      <MapContainer center={coords} zoom={15} style={{ height: '100%', width: '100%' }}>
        <ChangeView center={coords} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={coords}>
          <Popup>
            <strong>{feria.nombre}</strong><br />
            {feria.direccion}
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default LeafletMap;
