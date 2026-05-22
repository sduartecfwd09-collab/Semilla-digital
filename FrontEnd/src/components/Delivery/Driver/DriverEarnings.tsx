import React, { useState, useEffect } from 'react';
import { deliveryService, DeliveryEarnings } from '../../../services/deliveryService';
import { DollarSign, Calendar, TrendingUp, Award } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import './DriverEarnings.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const DriverEarnings: React.FC = () => {
  const [earnings, setEarnings] = useState<DeliveryEarnings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const data = await deliveryService.getMyEarnings();
        
        // Si no hay ganancias (todas en 0), mostrar datos de prueba
        if (data && data.today.count === 0 && data.week.count === 0 && data.month.count === 0) {
          const mockData: DeliveryEarnings = {
            today: { earnings: 15500, count: 4 },
            week: { earnings: 65000, count: 18 },
            month: { earnings: 245000, count: 72 },
            recentDeliveries: [
              {
                id: '1',
                delivered_at: new Date().toISOString(),
                order_id: 'ORD-1029',
                distance_km: 3.5,
                rating: { score: 5 },
                total_cost: '3500'
              },
              {
                id: '2',
                delivered_at: new Date(Date.now() - 86400000).toISOString(),
                order_id: 'ORD-1028',
                distance_km: 5.2,
                rating: { score: 4 },
                total_cost: '4200'
              },
              {
                id: '3',
                delivered_at: new Date(Date.now() - 172800000).toISOString(),
                order_id: 'ORD-1025',
                distance_km: 2.1,
                rating: null,
                total_cost: '2800'
              }
            ],
            weeklyChartData: [
              { date: 'Lun', earnings: 8500 },
              { date: 'Mar', earnings: 12000 },
              { date: 'Mié', earnings: 9000 },
              { date: 'Jue', earnings: 15000 },
              { date: 'Vie', earnings: 0 },
              { date: 'Sáb', earnings: 11500 },
              { date: 'Dom', earnings: 15500 }
            ]
          };
          setEarnings(mockData);
        } else {
          setEarnings(data);
        }
      } catch (error) {
        console.error('Error fetching earnings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEarnings();
  }, []);

  if (loading) return <div className="loading-state">Cargando ganancias...</div>;
  if (!earnings) return <div className="error-state">Error al cargar ganancias</div>;

  return (
    <div className="driver-earnings-page">
      <header className="page-header">
        <h1>Ganancias</h1>
        <p>Resumen de tus ingresos como repartidor.</p>
      </header>

      <div className="earnings-summary-grid">
        <div className="earnings-card primary">
          <div className="card-top">
            <div className="icon-wrapper">
              <DollarSign size={28} />
            </div>
            <span>Hoy</span>
          </div>
          <div className="card-amount">₡{earnings.today.earnings.toLocaleString()}</div>
          <div className="card-bottom">
            <span>{earnings.today.count} entregas</span>
          </div>
        </div>

        <div className="earnings-card">
          <div className="card-top">
            <div className="icon-wrapper">
              <Calendar size={28} />
            </div>
            <span>Esta Semana</span>
          </div>
          <div className="card-amount">₡{earnings.week.earnings.toLocaleString()}</div>
          <div className="card-bottom">
            <span>{earnings.week.count} entregas</span>
          </div>
        </div>

        <div className="earnings-card">
          <div className="card-top">
            <div className="icon-wrapper">
              <TrendingUp size={28} />
            </div>
            <span>Este Mes</span>
          </div>
          <div className="card-amount">₡{earnings.month.earnings.toLocaleString()}</div>
          <div className="card-bottom">
            <span>{earnings.month.count} entregas</span>
          </div>
        </div>
      </div>

      {earnings.weeklyChartData && earnings.weeklyChartData.length > 0 && (
        <div className="chart-section" style={{ backgroundColor: 'var(--verde-oscuro)', padding: '20px', borderRadius: '12px', marginBottom: '30px', border: '1px solid var(--verde-borde)' }}>
          <h2 style={{ marginBottom: '20px', fontSize: '1.2rem' }}>Ganancias de los últimos 7 días</h2>
          <div style={{ height: '300px' }}>
            <Bar
              data={{
                labels: earnings.weeklyChartData.map((d: any) => d.date),
                datasets: [
                  {
                    label: 'Ganancias (₡)',
                    data: earnings.weeklyChartData.map((d: any) => d.earnings),
                    backgroundColor: '#36EB60',
                    borderRadius: 4,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false
                  },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        let label = context.dataset.label || '';
                        if (label) {
                          label += ': ';
                        }
                        if (context.parsed.y !== null) {
                          label += new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'CRC' }).format(context.parsed.y);
                        }
                        return label;
                      }
                    }
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: { color: '#9ca3af' },
                    grid: { color: 'rgba(255,255,255,0.1)' }
                  },
                  x: {
                    ticks: { color: '#9ca3af' },
                    grid: { display: false }
                  }
                }
              }}
            />
          </div>
        </div>
      )}

      <div className="recent-payouts-section">
        <h2>Entregas Recientes</h2>
        
        {earnings.recentDeliveries.length === 0 ? (
          <div className="empty-state">
            <Award size={48} />
            <p>Aún no tienes entregas completadas.</p>
          </div>
        ) : (
          <div className="payouts-table-container">
            <table className="payouts-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>ID Pedido</th>
                  <th>Distancia</th>
                  <th>Calificación</th>
                  <th className="text-right">Monto</th>
                </tr>
              </thead>
              <tbody>
                {earnings.recentDeliveries.map((delivery: any) => (
                  <tr key={delivery.id}>
                    <td>
                      {new Date(delivery.delivered_at).toLocaleDateString('es-CR', { 
                        month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' 
                      })}
                    </td>
                    <td className="order-id-cell">#{delivery.order_id}</td>
                    <td>{delivery.distance_km ? `${delivery.distance_km} km` : '-'}</td>
                    <td>
                      {delivery.rating ? (
                        <div className="rating-cell">
                          <StarIcon /> {delivery.rating.score}
                        </div>
                      ) : (
                        <span className="no-rating">Sin calificar</span>
                      )}
                    </td>
                    <td className="text-right amount-cell">
                      ₡{parseFloat(delivery.total_cost).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const StarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="#facc15" stroke="#facc15" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
  </svg>
);

export default DriverEarnings;
