import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import Swal from 'sweetalert2';
import { Truck, MapPin, CheckCircle, Navigation, Star, TrendingUp, Package, XCircle } from 'lucide-react';
import { deliveryService, DeliveryOrder, DriverProfile, DriverStats } from '../../services/deliveryService';
import { API_BASE_URL } from '../../services/api.config';
import './DeliveryDashboard.css';

const DeliveryDashboard: React.FC = () => {
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [profile, setProfile] = useState<DriverProfile | null>(null);
  const [stats, setStats] = useState<DriverStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [locationInterval, setLocationInterval] = useState<ReturnType<typeof setInterval> | null>(null);

  const fetchDashboardData = async () => {
    try {
      const [profileData, statsData, ordersData] = await Promise.all([
        deliveryService.getMyProfile(),
        deliveryService.getMyStats(),
        deliveryService.getMyOrders('ASSIGNED,ACCEPTED,PICKED_UP,IN_TRANSIT') // Only active ones
      ]);
      setProfile(profileData);
      setStats(statsData);
      setOrders(ordersData.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Setup Socket
    const newSocket = io(API_BASE_URL);
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
      if (locationInterval) clearInterval(locationInterval);
    };
  }, []);

  useEffect(() => {
    if (socket && profile) {
      socket.emit('joinDriver', profile.user_id); // Join driver room

      socket.on('newOrderAssigned', () => {
        // Play notification sound
        const audio = new Audio('/notification.mp3');
        audio.play().catch(e => console.log('Audio play failed:', e));
        
        Swal.fire({
          title: '¡Nuevo Pedido!',
          text: 'Se te ha asignado un nuevo pedido.',
          icon: 'info',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 5000,
          background: '#1b4332',
          color: '#fff',
        });
        fetchDashboardData();
      });

      socket.on('orderStatusUpdated', () => {
        fetchDashboardData();
      });
    }
  }, [socket, profile]);

  // Simulated GPS tracking
  const startLocationTracking = () => {
    if (locationInterval) clearInterval(locationInterval);
    
    // Default origin (San José center if no active order)
    let lat = 9.9281;
    let lng = -84.0907;

    const interval = setInterval(() => {
      // Small random movement
      lat += (Math.random() - 0.5) * 0.001;
      lng += (Math.random() - 0.5) * 0.001;
      
      deliveryService.updateLocation(lat, lng).catch(e => console.error('Error updating location', e));
    }, 10000); // Update every 10 seconds

    setLocationInterval(interval);
  };

  const stopLocationTracking = () => {
    if (locationInterval) {
      clearInterval(locationInterval);
      setLocationInterval(null);
    }
  };

  useEffect(() => {
    if (profile?.status === 'AVAILABLE' || profile?.status === 'BUSY') {
      startLocationTracking();
    } else {
      stopLocationTracking();
    }
    
    return () => stopLocationTracking();
  }, [profile?.status]);

  const toggleDriverStatus = async () => {
    if (!profile) return;
    const newStatus = profile.status === 'OFFLINE' ? 'AVAILABLE' : 'OFFLINE';
    try {
      setProfile({ ...profile, status: newStatus });
      await deliveryService.updateDriverStatus(newStatus);
    } catch (error: any) {
      setProfile({ ...profile, status: profile.status }); // Revert
      Swal.fire({ icon: 'error', title: 'Error', text: error.message });
    }
  };

  const handleAcceptOrder = async (orderId: string) => {
    try {
      await deliveryService.acceptOrder(orderId);
      fetchDashboardData();
      Swal.fire({ icon: 'success', title: 'Pedido Aceptado', toast: true, position: 'top-end', timer: 3000, showConfirmButton: false });
    } catch (error: any) {
      Swal.fire({ icon: 'error', title: 'No se pudo aceptar', text: error.message });
      fetchDashboardData(); // Refresh to sync state
    }
  };

  const handleRejectOrder = async (orderId: string) => {
    try {
      await deliveryService.rejectOrder(orderId);
      fetchDashboardData();
    } catch (error: any) {
      Swal.fire({ icon: 'error', title: 'Error', text: error.message });
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      await deliveryService.updateOrderStatus(orderId, newStatus);
      fetchDashboardData();
    } catch (error: any) {
      Swal.fire({ icon: 'error', title: 'Error', text: error.message });
    }
  };

  if (loading) return <div className="loading-state">Cargando dashboard...</div>;

  return (
    <div className="delivery-dashboard">
      <header className="dashboard-header">
        <div>
          <h1 className="greeting">Hola, {profile?.usuario?.name || 'Repartidor'}</h1>
          <p className="subtitle">Aquí tienes el resumen de tu actividad de hoy.</p>
        </div>
        <div className="status-toggle-container">
          <span className="status-label">{profile?.status === 'OFFLINE' ? 'Desconectado' : 'Conectado'}</span>
          <label className="switch">
            <input 
              type="checkbox" 
              checked={profile?.status !== 'OFFLINE'} 
              onChange={toggleDriverStatus} 
            />
            <span className="slider round"></span>
          </label>
        </div>
      </header>

      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper blue">
            <Package size={24} />
          </div>
          <div className="stat-info">
            <h3>{stats?.deliveredToday || 0}</h3>
            <p>Entregas Hoy</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper green">
            <TrendingUp size={24} />
          </div>
          <div className="stat-info">
            <h3>₡{(stats?.earningsToday || 0).toLocaleString()}</h3>
            <p>Ganancias Hoy</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper yellow">
            <Star size={24} />
          </div>
          <div className="stat-info">
            <h3>{(stats?.rating || 5.0).toFixed(1)}</h3>
            <p>Calificación Promedio</p>
          </div>
        </div>
      </section>

      <section className="active-orders-section">
        <div className="section-header">
          <h2>Pedidos Activos</h2>
          {profile?.status === 'OFFLINE' && orders.length === 0 && (
            <span className="offline-warning">Conéctate para recibir pedidos</span>
          )}
        </div>

        <div className="orders-list">
          {orders.length === 0 ? (
            <div className="empty-state">
              <Truck size={64} />
              <p>No tienes pedidos activos en este momento.</p>
              {profile?.status !== 'OFFLINE' && <div className="radar-pulse-small"></div>}
            </div>
          ) : (
            orders.map(order => (
              <div key={order.id} className={`order-card status-${order.status.toLowerCase()}`}>
                <div className="order-header">
                  <div className="order-id">
                    <span className="id-label">Orden #{order.order_id}</span>
                    <span className={`status-badge ${order.status.toLowerCase()}`}>
                      {order.status === 'ASSIGNED' ? 'NUEVA' : 
                       order.status === 'ACCEPTED' ? 'ACEPTADA' : 
                       order.status === 'PICKED_UP' ? 'RECOGIDA' : 
                       order.status === 'IN_TRANSIT' ? 'EN CAMINO' : order.status}
                    </span>
                  </div>
                  <span className="fee">₡{order.total_cost?.toLocaleString()}</span>
                </div>
                
                <div className="order-route">
                  <div className="route-point">
                    <MapPin size={18} color="#9ca3af" /> 
                    <div className="address">
                      <span className="address-label">Recogida</span>
                      <span className="address-text">{order.pickup_address}</span>
                    </div>
                  </div>
                  <div className="route-line"></div>
                  <div className="route-point">
                    <Navigation size={18} color="#36EB60" /> 
                    <div className="address">
                      <span className="address-label">Entrega</span>
                      <span className="address-text">{order.dropoff_address}</span>
                    </div>
                  </div>
                </div>
                
                <div className="order-actions">
                  {order.status === 'ASSIGNED' && (
                    <>
                      <button className="action-btn btn-danger" onClick={() => handleRejectOrder(order.id)}>
                        <XCircle size={18} /> Rechazar
                      </button>
                      <button className="action-btn btn-success animate-pulse" onClick={() => handleAcceptOrder(order.id)}>
                        <CheckCircle size={18} /> Aceptar Viaje
                      </button>
                    </>
                  )}
                  {order.status === 'ACCEPTED' && (
                    <button className="action-btn btn-primary" onClick={() => handleUpdateStatus(order.id, 'PICKED_UP')}>
                      <Package size={18} /> Marcar como Recogido
                    </button>
                  )}
                  {order.status === 'PICKED_UP' && (
                    <button className="action-btn btn-primary" onClick={() => handleUpdateStatus(order.id, 'IN_TRANSIT')}>
                      <Navigation size={18} /> En Camino a Entrega
                    </button>
                  )}
                  {order.status === 'IN_TRANSIT' && (
                    <button className="action-btn btn-success" onClick={() => handleUpdateStatus(order.id, 'DELIVERED')}>
                      <CheckCircle size={18} /> Entrega Completada
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default DeliveryDashboard;
