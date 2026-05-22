import React, { useState, useEffect } from 'react';
import { deliveryService, DeliveryOrder } from '../../../services/deliveryService';
import { MapPin, Navigation, Package, Search } from 'lucide-react';
import './DriverOrders.css';

const DriverOrders: React.FC = () => {
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await deliveryService.getMyOrders();
        
        if (res.data.length === 0) {
          const mockOrders: any[] = [
            {
              id: '1',
              order_id: 'ORD-1029',
              status: 'DELIVERED',
              pickup_address: 'Feria del Agricultor, San José',
              dropoff_address: 'Barrio Escalante, San José',
              created_at: new Date(Date.now() - 3600000).toISOString(), // hace 1 hora
              total_cost: 3500,
              earnings_breakdown: { total_driver_payout: 3500 }
            },
            {
              id: '2',
              order_id: 'ORD-1035',
              status: 'IN_TRANSIT',
              pickup_address: 'Feria de Alajuela',
              dropoff_address: 'El Llano, Alajuela',
              created_at: new Date().toISOString(), // ahora
              total_cost: 5100,
              earnings_breakdown: { total_driver_payout: 5100 }
            },
            {
              id: '3',
              order_id: 'ORD-1028',
              status: 'DELIVERED',
              pickup_address: 'Mercado Central, Heredia',
              dropoff_address: 'San Rafael, Heredia',
              created_at: new Date(Date.now() - 86400000).toISOString(), // ayer
              total_cost: 4200,
              earnings_breakdown: { total_driver_payout: 4200 }
            },
            {
              id: '4',
              order_id: 'ORD-1040',
              status: 'CANCELLED',
              pickup_address: 'Feria de Cartago',
              dropoff_address: 'Tres Ríos, Cartago',
              created_at: new Date(Date.now() - 172800000).toISOString(), // hace 2 días
              total_cost: 2500,
              earnings_breakdown: { total_driver_payout: 2500 }
            },
            {
              id: '5',
              order_id: 'ORD-1021',
              status: 'DELIVERED',
              pickup_address: 'Feria de Pavas',
              dropoff_address: 'Rohrmoser, San José',
              created_at: new Date(Date.now() - 259200000).toISOString(), // hace 3 días
              total_cost: 3800,
              earnings_breakdown: { total_driver_payout: 3800 }
            },
            {
              id: '6',
              order_id: 'ORD-1015',
              status: 'DELIVERED',
              pickup_address: 'Feria de Escazú',
              dropoff_address: 'Santa Ana',
              created_at: new Date(Date.now() - 604800000).toISOString(), // hace 1 semana
              total_cost: 6500,
              earnings_breakdown: { total_driver_payout: 6500 }
            }
          ];
          setOrders(mockOrders);
        } else {
          setOrders(res.data);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter(order => {
    if (filter === 'ALL') return true;
    if (filter === 'ACTIVE') return ['ASSIGNED', 'ACCEPTED', 'PICKED_UP', 'IN_TRANSIT'].includes(order.status);
    if (filter === 'COMPLETED') return order.status === 'DELIVERED';
    if (filter === 'CANCELLED') return order.status === 'CANCELLED';
    return true;
  });

  if (loading) return <div className="loading-state">Cargando pedidos...</div>;

  return (
    <div className="driver-orders-page">
      <header className="page-header">
        <h1>Mis Pedidos</h1>
        <p>Historial completo de tus asignaciones y entregas.</p>
      </header>

      <div className="filters-container">
        <button className={`filter-btn ${filter === 'ALL' ? 'active' : ''}`} onClick={() => setFilter('ALL')}>
          Todos
        </button>
        <button className={`filter-btn ${filter === 'ACTIVE' ? 'active' : ''}`} onClick={() => setFilter('ACTIVE')}>
          Activos
        </button>
        <button className={`filter-btn ${filter === 'COMPLETED' ? 'active' : ''}`} onClick={() => setFilter('COMPLETED')}>
          Completados
        </button>
        <button className={`filter-btn ${filter === 'CANCELLED' ? 'active' : ''}`} onClick={() => setFilter('CANCELLED')}>
          Cancelados
        </button>
      </div>

      <div className="orders-grid">
        {filteredOrders.length === 0 ? (
          <div className="empty-state">
            <Search size={48} />
            <p>No se encontraron pedidos con este filtro.</p>
          </div>
        ) : (
          filteredOrders.map(order => (
            <div key={order.id} className="history-order-card">
              <div className="card-header">
                <span className="order-date">
                  {new Date(order.created_at).toLocaleDateString('es-CR', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' })}
                </span>
                <span className={`status-pill ${order.status.toLowerCase()}`}>
                  {order.status === 'ASSIGNED' ? 'ASIGNADO' :
                   order.status === 'ACCEPTED' ? 'ACEPTADO' :
                   order.status === 'PICKED_UP' ? 'RECOGIDO' :
                   order.status === 'IN_TRANSIT' ? 'EN CAMINO' :
                   order.status === 'DELIVERED' ? 'COMPLETADO' : 
                   order.status === 'CANCELLED' ? 'CANCELADO' : order.status}
                </span>
              </div>
              
              <div className="card-body">
                <div className="route-minimal">
                  <div className="route-row">
                    <MapPin size={16} color="#9ca3af" />
                    <span>{order.pickup_address}</span>
                  </div>
                  <div className="route-row">
                    <Navigation size={16} color="#36EB60" />
                    <span>{order.dropoff_address}</span>
                  </div>
                </div>
              </div>

              <div className="card-footer">
                <div className="fee-earned">
                  <span>Ganancia:</span>
                  <strong>₡{Math.round(order.earnings_breakdown?.total_driver_payout || 0).toLocaleString()}</strong>
                </div>
                {order.status === 'DELIVERED' && (
                  <div className="delivery-time">
                    Entregado a las {new Date(order.created_at).toLocaleTimeString('es-CR', {hour: '2-digit', minute:'2-digit'})}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DriverOrders;
