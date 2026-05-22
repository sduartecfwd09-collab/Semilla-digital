import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import { Truck, CheckCircle, Clock, MapPin, Package, Star, MessageSquare } from 'lucide-react';
import { deliveryService, DeliveryOrder } from '../../services/deliveryService';
import { API_BASE_URL } from '../../services/api.config';
import './ClientDeliveryTracker.css';

const ClientDeliveryTracker: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<DeliveryOrder | null>(null);
  const [driverLocation, setDriverLocation] = useState<{lat: number, lng: number} | null>(null);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);
  
  // Rating states
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingScore, setRatingScore] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);

  const fetchOrder = async () => {
    if (!id) return;
    try {
      const data = await deliveryService.getOrderById(id);
      setOrder(data);
      
      // If order is delivered and hasn't been rated, prompt rating
      if (data.status === 'DELIVERED' && !data.rating) {
        setShowRatingModal(true);
      }
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();

    const newSocket = io(API_BASE_URL);
    setSocket(newSocket);

    return () => { newSocket.disconnect(); };
  }, [id]);

  useEffect(() => {
    if (socket && id) {
      socket.emit('joinOrder', id);

      socket.on('orderStatusUpdated', (data) => {
        setOrder(prev => prev ? { ...prev, status: data.status, driver_id: data.driverId || prev.driver_id } : null);
        if (data.status === 'DELIVERED') {
            setShowRatingModal(true);
        }
        // Force a refetch to get driver details if newly assigned
        if (data.status === 'ASSIGNED') {
            fetchOrder();
        }
      });

      socket.on('driverLocationUpdated', (data) => {
        setDriverLocation({ lat: data.lat, lng: data.lng });
      });
    }
  }, [socket, id]);

  const submitRating = async () => {
    if (ratingScore === 0) {
      Swal.fire({ icon: 'warning', title: 'Falta calificación', text: 'Por favor selecciona las estrellas.' });
      return;
    }
    
    try {
      setSubmittingRating(true);
      await deliveryService.submitRating(id as string, ratingScore, ratingComment);
      setShowRatingModal(false);
      Swal.fire({ icon: 'success', title: '¡Gracias!', text: 'Tu calificación ha sido enviada.' });
      fetchOrder(); // refresh to show rating
    } catch (error: any) {
      Swal.fire({ icon: 'error', title: 'Error', text: error.message });
    } finally {
      setSubmittingRating(false);
    }
  };

  if (loading) return <div className="tracker-loading">Cargando información del pedido...</div>;
  if (!order) return <div className="tracker-error">Pedido no encontrado</div>;

  const getStatusIndex = () => {
    const orderStatusArray = ['PENDING', 'QUEUED', 'ASSIGNED', 'ACCEPTED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED'];
    return orderStatusArray.indexOf(order.status);
  };

  const currentIndex = getStatusIndex();
  const driver = (order as any).driver; // type assertion for included data

  return (
    <div className="client-tracker-container">
      <div className="tracker-main">
        
        <div className="tracker-header">
          <h1>Rastreo de Pedido</h1>
          <span className="order-number">Orden #{order.order_id}</span>
        </div>

        {/* Live Map / Mock Map */}
        <div className="tracker-map-view">
          {driverLocation || currentIndex >= 4 ? (
             <div className="map-marker animated-bounce">
               <Truck size={32} color="#ffffff" />
               <div className="marker-pulse"></div>
             </div>
          ) : (
            <div className="map-placeholder">
              <div className="radar-pulse"></div>
              <span>
                {currentIndex < 2 ? 'Buscando al mejor repartidor...' : 
                 currentIndex < 4 ? 'El repartidor está en camino al comercio' : 
                 'En camino...'}
              </span>
            </div>
          )}
        </div>

        {/* Driver Info */}
        {driver && (
          <div className="driver-info-card">
            <div className="driver-avatar-circle">
              {driver.usuario?.name?.charAt(0).toUpperCase() || 'R'}
            </div>
            <div className="driver-details">
              <h3>{driver.usuario?.name || 'Repartidor'}</h3>
              <div className="driver-rating">
                <Star size={14} fill="#facc15" color="#facc15" />
                <span>{parseFloat(driver.rating).toFixed(1)}</span>
                <span className="vehicle-type">• {driver.vehicle_type}</span>
              </div>
            </div>
            <div className="driver-contact">
              <button className="contact-btn call"><Clock size={20} /></button>
            </div>
          </div>
        )}

        {/* Timeline */}
        <div className="tracker-timeline-card">
          <h3>Estado del Pedido</h3>
          <div className="vertical-timeline">
            <div className={`v-step ${currentIndex >= 0 ? 'active' : ''}`}>
              <div className="v-icon"><Clock size={16} /></div>
              <div className="v-content">
                <h4>Procesando</h4>
                <p>Confirmando disponibilidad</p>
              </div>
            </div>
            <div className={`v-step ${currentIndex >= 2 ? 'active' : ''}`}>
              <div className="v-icon"><Truck size={16} /></div>
              <div className="v-content">
                <h4>Asignado</h4>
                <p>Un repartidor tomó tu pedido</p>
              </div>
            </div>
            <div className={`v-step ${currentIndex >= 4 ? 'active' : ''}`}>
              <div className="v-icon"><Package size={16} /></div>
              <div className="v-content">
                <h4>Recogido</h4>
                <p>El pedido va en camino hacia ti</p>
              </div>
            </div>
            <div className={`v-step ${currentIndex >= 6 ? 'active' : ''}`}>
              <div className="v-icon"><CheckCircle size={16} /></div>
              <div className="v-content">
                <h4>Entregado</h4>
                <p>Disfruta tu pedido</p>
              </div>
            </div>
          </div>
        </div>

        {/* Order Info */}
        <div className="tracker-details-card">
          <div className="detail-row">
            <MapPin size={18} color="#9ca3af" />
            <div className="detail-text">
              <span>Entrega a</span>
              <strong>{order.dropoff_address}</strong>
            </div>
          </div>
          <div className="detail-row">
            <DollarSignIcon />
            <div className="detail-text">
              <span>Costo de envío</span>
              <strong>₡{order.total_cost?.toLocaleString()}</strong>
            </div>
          </div>
        </div>

      </div>

      {/* Rating Modal */}
      {showRatingModal && (
        <div className="rating-modal-overlay">
          <div className="rating-modal">
            <h2>¡Tu pedido ha llegado!</h2>
            <p>¿Qué tal te pareció el servicio de {driver?.usuario?.name || 'tu repartidor'}?</p>
            
            <div className="stars-container">
              {[1, 2, 3, 4, 5].map((star) => (
                <button 
                  key={star} 
                  className={`star-btn ${ratingScore >= star ? 'active' : ''}`}
                  onClick={() => setRatingScore(star)}
                >
                  <Star size={32} fill={ratingScore >= star ? "#facc15" : "transparent"} color={ratingScore >= star ? "#facc15" : "#d1d5db"} />
                </button>
              ))}
            </div>

            <div className="comment-box">
              <label>Comentario (opcional)</label>
              <textarea 
                placeholder="Rápido, amable, etc..."
                value={ratingComment}
                onChange={(e) => setRatingComment(e.target.value)}
                maxLength={200}
              />
            </div>

            <button className="submit-rating-btn" onClick={submitRating} disabled={submittingRating}>
              {submittingRating ? 'Enviando...' : 'Calificar Repartidor'}
            </button>
            <button className="skip-rating-btn" onClick={() => setShowRatingModal(false)}>
              Saltar por ahora
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const DollarSignIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23"></line>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
  </svg>
);

export default ClientDeliveryTracker;
