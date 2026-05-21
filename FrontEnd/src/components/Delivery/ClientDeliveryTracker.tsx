import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { Package, Truck, CheckCircle, Clock } from 'lucide-react';
import { useParams } from 'react-router-dom';
import './ClientDeliveryTracker.css';

const SOCKET_SERVER_URL = 'http://localhost:3002';

const ClientDeliveryTracker: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const orderId = id ? parseInt(id, 10) : 0;
  
  const [status, setStatus] = useState<string>('pending');
  const [driverLocation, setDriverLocation] = useState<{lat: number, lng: number} | null>(null);

  useEffect(() => {
    const socket = io(SOCKET_SERVER_URL);
    socket.emit('joinOrder', orderId);

    fetch(`http://localhost:3002/delivery/orders`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const myOrder = data.data.find((o: any) => o.id === orderId);
          if (myOrder) setStatus(myOrder.status);
        }
      });

    socket.on('orderStatusUpdated', (data) => {
      setStatus(data.status);
    });

    socket.on('driverLocationUpdated', (data) => {
      setDriverLocation({ lat: data.latitude, lng: data.longitude });
    });

    return () => { socket.disconnect(); };
  }, [orderId]);

  const getStatusIndex = () => {
    const order = ['pending', 'assigned', 'accepted', 'picked_up', 'in_transit', 'delivered'];
    return order.indexOf(status);
  };

  const currentIndex = getStatusIndex();

  return (
    <div className="client-tracker-container">
      <div className="tracker-card">
        <h2 className="tracker-title">Sigue tu pedido</h2>
        
        <div className="tracker-map-mock">
          {driverLocation || currentIndex >= 4 ? (
             <div className="map-marker animated-bounce">
               <Truck size={32} color="#ffffff" />
             </div>
          ) : (
            <div className="map-placeholder">
              <div className="radar-pulse"></div>
              <span>{currentIndex < 1 ? 'Buscando repartidor...' : 'El repartidor está en camino al comercio'}</span>
            </div>
          )}
        </div>

        <div className="status-timeline">
          <div className={`timeline-step ${currentIndex >= 0 ? 'active' : ''}`}>
            <div className="step-icon"><Clock size={20} /></div>
            <div className="step-text">Confirmando</div>
          </div>
          <div className={`timeline-line ${currentIndex >= 2 ? 'active' : ''}`}></div>
          <div className={`timeline-step ${currentIndex >= 3 ? 'active' : ''}`}>
            <div className="step-icon"><Package size={20} /></div>
            <div className="step-text">Recogido</div>
          </div>
          <div className={`timeline-line ${currentIndex >= 4 ? 'active' : ''}`}></div>
          <div className={`timeline-step ${currentIndex >= 4 ? 'active' : ''}`}>
            <div className="step-icon"><Truck size={20} /></div>
            <div className="step-text">En Camino</div>
          </div>
          <div className={`timeline-line ${currentIndex >= 5 ? 'active' : ''}`}></div>
          <div className={`timeline-step ${currentIndex >= 5 ? 'active' : ''}`}>
            <div className="step-icon"><CheckCircle size={20} /></div>
            <div className="step-text">Entregado</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDeliveryTracker;
