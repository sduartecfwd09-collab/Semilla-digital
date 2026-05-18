import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { Truck, MapPin, CheckCircle, Navigation } from 'lucide-react';
import './DeliveryDashboard.css';

const SOCKET_SERVER_URL = 'http://localhost:3002';

interface Order {
  id: number;
  pickup_address: string;
  delivery_address: string;
  status: string;
  delivery_fee: number;
  proforma_id: string;
}

const DeliveryDashboard: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [driverId, setDriverId] = useState<number | null>(null);
  const [status, setStatus] = useState<'inactive' | 'active' | 'busy'>('inactive');

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setDriverId(user.id);
    }
  }, []);

  useEffect(() => {
    if (!driverId) return;

    const socket = io(SOCKET_SERVER_URL);
    socket.emit('joinDriver', driverId);

    fetch(`http://localhost:3002/delivery/orders`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setOrders(data.data.filter((o: Order) => o.status !== 'delivered' && o.status !== 'cancelled'));
        }
      });

    socket.on('orderAssigned', (data) => {
      if (data.driverId === driverId) {
        fetch(`http://localhost:3002/delivery/orders`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
        .then(res => res.json())
        .then(resData => {
            if (resData.success) {
              setOrders(resData.data.filter((o: Order) => o.status !== 'delivered' && o.status !== 'cancelled'));
            }
        });
      }
    });

    socket.on('orderStatusUpdated', (data) => {
      setOrders(prev => prev.map(o => o.id === data.orderId ? { ...o, status: data.status } : o));
    });

    return () => {
      socket.disconnect();
    };
  }, [driverId]);

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    await fetch(`http://localhost:3002/delivery/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ status: newStatus })
    });
  };

  const toggleDriverStatus = async () => {
    const newStatus = status === 'active' ? 'inactive' : 'active';
    await fetch(`http://localhost:3002/delivery/drivers/${driverId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ status: newStatus })
    });
    setStatus(newStatus);
  };

  return (
    <div className="delivery-dashboard-container dark-mode">
      <header className="dashboard-header">
        <h1>Driver Dashboard</h1>
        <button 
          className={`status-toggle ${status}`} 
          onClick={toggleDriverStatus}
        >
          {status === 'active' ? 'Go Offline' : 'Go Online'}
        </button>
      </header>
      
      <main className="orders-list">
        {orders.length === 0 ? (
          <div className="empty-state">
            <Truck size={48} />
            <p>Esperando pedidos...</p>
          </div>
        ) : (
          orders.map(order => (
            <div key={order.id} className={`order-card status-${order.status}`}>
              <div className="order-header">
                <h3>Orden #{order.id}</h3>
                <span className="fee">₡{order.delivery_fee}</span>
              </div>
              <div className="order-route">
                <div className="route-point">
                  <MapPin size={16} /> <span>{order.pickup_address}</span>
                </div>
                <div className="route-line"></div>
                <div className="route-point">
                  <Navigation size={16} /> <span>{order.delivery_address}</span>
                </div>
              </div>
              
              <div className="order-actions">
                {order.status === 'assigned' && (
                  <button className="action-btn btn-primary" onClick={() => updateOrderStatus(order.id, 'accepted')}>
                    <CheckCircle size={20} /> Aceptar Viaje
                  </button>
                )}
                {order.status === 'accepted' && (
                  <button className="action-btn btn-secondary" onClick={() => updateOrderStatus(order.id, 'picked_up')}>
                    Marcar como Recogido
                  </button>
                )}
                {order.status === 'picked_up' && (
                  <button className="action-btn btn-secondary" onClick={() => updateOrderStatus(order.id, 'in_transit')}>
                    En Camino
                  </button>
                )}
                {order.status === 'in_transit' && (
                  <button className="action-btn btn-success" onClick={() => updateOrderStatus(order.id, 'delivered')}>
                    Entregado
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
};

export default DeliveryDashboard;
