import React, { useState, useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import Swal from 'sweetalert2';
import {
  Truck, MapPin, CheckCircle, Navigation, Star, TrendingUp,
  Package, XCircle, DollarSign, Weight, Camera, PenTool, X, Upload, Wallet, Bell
} from 'lucide-react';
import { deliveryService, DeliveryOrder, DriverProfile, DriverStats, calculateDriverEarnings, EarningsParams } from '../../services/deliveryService';
import { API_BASE_URL } from '../../services/api.config';
import './DeliveryDashboard.css';

// ── Proof-of-Delivery Modal ──────────────────────────────────────────────────
interface ProofModalProps {
  order: DeliveryOrder;
  onConfirm: (proofUrl: string) => void;
  onClose: () => void;
}

const ProofOfDeliveryModal: React.FC<ProofModalProps> = ({ order, onConfirm, onClose }) => {
  const [mode, setMode] = useState<'photo' | 'signature'>('photo');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Canvas drawing ──────────────────────────────────────────────────────────
  const getPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
    return { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    setIsDrawing(true);
    setHasSigned(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const pos = getPos(e, canvas);
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#36EB60';
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const stopDraw = () => setIsDrawing(false);

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSigned(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleConfirm = () => {
    if (mode === 'photo') {
      if (!photoPreview) {
        Swal.fire({ icon: 'warning', title: 'Foto requerida', text: 'Por favor sube una foto del producto entregado.', background: '#1b2a1e', color: '#fff' });
        return;
      }
      onConfirm(photoPreview);
    } else {
      if (!hasSigned) {
        Swal.fire({ icon: 'warning', title: 'Firma requerida', text: 'Por favor dibuja la firma del cliente.', background: '#1b2a1e', color: '#fff' });
        return;
      }
      const canvas = canvasRef.current;
      if (!canvas) return;
      onConfirm(canvas.toDataURL('image/png'));
    }
  };

  return (
    <div className="proof-modal-overlay" onClick={onClose}>
      <div className="proof-modal" onClick={e => e.stopPropagation()}>
        <div className="proof-modal-header">
          <h3>Confirmar Entrega</h3>
          <span className="proof-order-id">Orden #{order.order_id}</span>
          <button className="proof-close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="proof-tabs">
          <button
            className={`proof-tab ${mode === 'photo' ? 'active' : ''}`}
            onClick={() => setMode('photo')}
          >
            <Camera size={16} /> Foto de Entrega
          </button>
          <button
            className={`proof-tab ${mode === 'signature' ? 'active' : ''}`}
            onClick={() => setMode('signature')}
          >
            <PenTool size={16} /> Firma Digital
          </button>
        </div>

        {mode === 'photo' ? (
          <div className="proof-photo-area">
            {photoPreview ? (
              <div className="photo-preview-wrapper">
                <img src={photoPreview} alt="Evidencia de entrega" className="photo-preview" />
                <button className="change-photo-btn" onClick={() => { setPhotoPreview(null); fileInputRef.current?.click(); }}>
                  Cambiar foto
                </button>
              </div>
            ) : (
              <div className="photo-upload-zone" onClick={() => fileInputRef.current?.click()}>
                <Upload size={40} />
                <p>Toca para subir la foto del producto entregado</p>
                <span>JPG, PNG · Máx 10MB</span>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          </div>
        ) : (
          <div className="proof-signature-area">
            <p className="sig-instructions">Pídele al cliente que firme en el recuadro:</p>
            <div className="canvas-wrapper">
              <canvas
                ref={canvasRef}
                width={420}
                height={180}
                className="signature-canvas"
                onMouseDown={startDraw}
                onMouseMove={draw}
                onMouseUp={stopDraw}
                onMouseLeave={stopDraw}
                onTouchStart={startDraw}
                onTouchMove={draw}
                onTouchEnd={stopDraw}
              />
              {!hasSigned && <span className="canvas-placeholder">Firma aquí</span>}
            </div>
            <button className="clear-sig-btn" onClick={clearSignature}>Limpiar firma</button>
          </div>
        )}

        <div className="proof-modal-footer">
          <button className="proof-cancel-btn" onClick={onClose}>Cancelar</button>
          <button className="proof-confirm-btn" onClick={handleConfirm}>
            <CheckCircle size={18} /> Confirmar Entrega
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Earnings Breakdown Card ──────────────────────────────────────────────────
interface EarningsBreakdownProps {
  order: DeliveryOrder;
}
const EarningsBreakdown: React.FC<EarningsBreakdownProps> = ({ order }) => {
  const earnings = order.earnings_breakdown;
  if (!earnings) return null;

  return (
    <div className="earnings-breakdown">
      <div className="earnings-title">
        <DollarSign size={14} />
        <span>Desglose de Ganancia Neta Asegurada</span>
      </div>
      <div className="earnings-rows">
        <div className="earnings-row">
          <span>Recogida en Comercio</span>
          <span>₡{Math.round(earnings.base_pickup_fee).toLocaleString()}</span>
        </div>
        <div className="earnings-row">
          <span>Entrega al Cliente</span>
          <span>₡{Math.round(earnings.base_dropoff_fee).toLocaleString()}</span>
        </div>
        <div className="earnings-row">
          <span>Distancia Eficiente ({(order.distance_km ?? 0).toFixed(1)} km)</span>
          <span>₡{Math.round(earnings.distance_fee).toLocaleString()}</span>
        </div>
        <div className="earnings-row">
          <span>Tiempo Estimado ({(order.estimated_time_mins ?? 0)} min)</span>
          <span>₡{Math.round(earnings.time_fee).toLocaleString()}</span>
        </div>
        
        {earnings.surge_multiplier > 1.0 && (
          <div className="earnings-row supplement">
            <span>Alta Demanda ({earnings.surge_multiplier}x)</span>
            <span>+₡{Math.round(earnings.gross_earnings - (earnings.gross_earnings / earnings.surge_multiplier)).toLocaleString()}</span>
          </div>
        )}
        
        <div className="earnings-row" style={{ color: '#ef4444' }}>
          <span>Tarifa de Servicio App ({(earnings.platform_commission_pct * 100).toFixed(0)}%)</span>
          <span>-₡{Math.round(earnings.platform_fee).toLocaleString()}</span>
        </div>

        {earnings.tips > 0 && (
          <div className="earnings-row tip">
            <span>Propina del cliente 🎉</span>
            <span>₡{Math.round(earnings.tips).toLocaleString()}</span>
          </div>
        )}
        <div className="earnings-row total">
          <span>Total Ganancia Neta</span>
          <span style={{ color: '#36EB60' }}>₡{Math.round(earnings.total_driver_payout).toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

// ── Main Dashboard ───────────────────────────────────────────────────────────
const DeliveryDashboard: React.FC = () => {
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [profile, setProfile] = useState<DriverProfile | null>(null);
  const [stats, setStats] = useState<DriverStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [locationInterval, setLocationInterval] = useState<ReturnType<typeof setInterval> | null>(null);
  const [proofOrder, setProofOrder] = useState<DeliveryOrder | null>(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      const [profileData, statsData, ordersData] = await Promise.all([
        deliveryService.getMyProfile(),
        deliveryService.getMyStats(),
        deliveryService.getMyOrders('ASSIGNED,ACCEPTED,PICKED_UP,IN_TRANSIT'),
      ]);
      setProfile(profileData);
      setStats(statsData);
      setOrders(ordersData.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, []);


  useEffect(() => {
    fetchDashboardData();
    const newSocket = io(API_BASE_URL);
    setSocket(newSocket);
    return () => {
      newSocket.disconnect();
      if (locationInterval) clearInterval(locationInterval);
    };
  }, []);

  useEffect(() => {
    if (socket && profile) {
      socket.emit('joinDriver', profile.user_id);
      socket.on('newOrderAssigned', () => {
        const audio = new Audio('/notification.mp3');
        audio.play().catch(() => {});
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
      socket.on('orderStatusUpdated', () => fetchDashboardData());
    }
  }, [socket, profile]);

  const startLocationTracking = () => {
    if (locationInterval) clearInterval(locationInterval);
    let lat = 9.9281;
    let lng = -84.0907;
    const interval = setInterval(() => {
      lat += (Math.random() - 0.5) * 0.001;
      lng += (Math.random() - 0.5) * 0.001;
      deliveryService.updateLocation(lat, lng).catch(() => {});
    }, 10000);
    setLocationInterval(interval);
  };

  const stopLocationTracking = () => {
    if (locationInterval) { clearInterval(locationInterval); setLocationInterval(null); }
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
      setProfile({ ...profile, status: profile.status });
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
      fetchDashboardData();
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

  const handleDeliveryConfirm = async (proofUrl: string) => {
    if (!proofOrder) return;
    try {
      await deliveryService.updateOrderStatus(proofOrder.id, 'DELIVERED', proofUrl);
      setProofOrder(null);
      fetchDashboardData();
      Swal.fire({
        icon: 'success',
        title: '¡Entrega Completada!',
        html: `Tu ganancia neta de <strong>₡${Math.round(proofOrder.earnings_breakdown?.total_driver_payout ?? 0).toLocaleString()}</strong> fue acreditada a tu saldo.`,
        background: '#1b2a1e',
        color: '#fff',
        confirmButtonColor: '#36EB60',
      });
    } catch (error: any) {
      Swal.fire({ icon: 'error', title: 'Error al confirmar', text: error.message });
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      ASSIGNED: 'NUEVA', ACCEPTED: 'ACEPTADA',
      PICKED_UP: 'RECOGIDA', IN_TRANSIT: 'EN CAMINO',
    };
    return labels[status] || status;
  };

  if (loading) return <div className="loading-state">Cargando dashboard...</div>;

  return (
    <div className="delivery-dashboard">
      {/* Brand Header */}
      <div className="brand-header">
        <div className="brand-logo">
          <svg className="logo-tractor-icon" viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 16a3 3 0 1 0 6 0 3 3 0 1 0-6 0Z" />
            <path d="M15 16a3 3 0 1 0 6 0 3 3 0 1 0-6 0Z" />
            <path d="M6 16v-2h9v2" />
            <path d="M9 10h6V8h-6V6H7v8" />
            <path d="M15 8h4l2 3v3h-6Z" />
          </svg>
          <span className="logo-text">AgroMap</span>
        </div>
        <button className="notification-btn" aria-label="Notificaciones">
          <Bell size={20} />
        </button>
      </div>

      {/* Welcome Banner Card */}
      <div className="welcome-banner-card">
        <div className="banner-badge">
          <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}>
            <path d="M3 16a3 3 0 1 0 6 0 3 3 0 1 0-6 0Z" />
            <path d="M15 16a3 3 0 1 0 6 0 3 3 0 1 0-6 0Z" />
            <path d="M6 16v-2h9v2" />
            <path d="M9 10h6V8h-6V6H7v8" />
            <path d="M15 8h4l2 3v3h-6Z" />
          </svg>
          AGROMAP CONDUCTOR
        </div>
        <h2 className="banner-title">Bienvenido al Panel de Control</h2>
        <p className="banner-subtitle">Conectando la frescura del campo directamente con el consumidor final.</p>
        
        <div className="banner-footer">
          <div className="banner-indicators">
            <span className="dot active"></span>
            <span className="dot"></span>
            <span className="dot"></span>
          </div>
          <div className="banner-download-badge">
            <span className="dl-text">DOWNLOAD NOW</span>
          </div>
        </div>
      </div>

      {/* Driver Profile */}
      <div className="driver-profile-card">
        <div className="driver-avatar-wrapper">
          <img src="/assets/driver_avatar.png" alt="Carlos" className="driver-avatar-img" />
        </div>
        <div className="driver-profile-info">
          <h2>Hola, {profile?.usuario?.name || 'Carlos'}</h2>
          <p>Conductor Verificado - AgroExpress</p>
        </div>
      </div>

      {/* Connectivity Status Card */}
      <div className="status-toggle-card">
        <span className="status-text">{profile?.status === 'OFFLINE' ? 'Desconectado' : 'Conectado'}</span>
        <label className="switch">
          <input type="checkbox" checked={profile?.status !== 'OFFLINE'} onChange={toggleDriverStatus} />
          <span className="slider round"></span>
        </label>
      </div>

      {/* Stats Grid */}
      <section className="stats-grid">
        {/* Entregas Card */}
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">ENTREGAS HOY</span>
            <Package size={20} className="stat-card-icon green" />
          </div>
          <h3 className="stat-value">{stats?.deliveredToday || 0}</h3>
          <div className="stat-card-footer">
            <TrendingUp size={14} className="trend-icon" />
            <span>Próximo envío en espera</span>
          </div>
        </div>

        {/* Ganancias Card */}
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">GANANCIAS HOY</span>
            <Wallet size={20} className="stat-card-icon yellow" />
          </div>
          <h3 className="stat-value">₡{(stats?.earningsToday || 0).toLocaleString()}</h3>
          <div className="stat-card-footer">
            <span>Meta diaria: ₡15.000</span>
          </div>
        </div>

        {/* Calificación Card */}
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">CALIFICACIÓN</span>
            <Star size={20} className="stat-card-icon yellow star" />
          </div>
          <h3 className="stat-value">{Number(stats?.rating || 5.0).toFixed(1)}</h3>
          <div className="stat-card-footer">
            <span>Basado en 42 entregas</span>
          </div>
        </div>
      </section>

      {/* Saldo Acumulado Card */}
      <div className="accumulated-balance-card">
        <div className="balance-info">
          <span className="balance-label">SALDO ACUMULADO</span>
          <h3 className="balance-value">₡{Number(profile?.accumulated_balance || 0).toFixed(2)}</h3>
          <p className="balance-desc">Disponible para retiro inmediato</p>
        </div>
        <button className="withdraw-btn" onClick={() => {
          Swal.fire({
            title: 'Retirar Fondos',
            text: '¿Deseas transferir tus fondos a tu cuenta bancaria registrada?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, retirar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#36EB60',
            background: '#0f2018',
            color: '#fff'
          }).then((result) => {
            if (result.isConfirmed) {
              Swal.fire({
                title: 'Retiro en proceso',
                text: 'Tu solicitud de retiro ha sido procesada con éxito.',
                icon: 'success',
                confirmButtonColor: '#36EB60',
                background: '#0f2018',
                color: '#fff'
              });
            }
          });
        }}>
          <Wallet size={18} />
          <span>Retirar Fondos</span>
        </button>
      </div>

      {/* Active Orders */}
      <section className="active-orders-section">
        <div className="section-header">
          <h2>Entregas Activas</h2>
          <span className="last-updated">Actualizado hace 1 min</span>
        </div>

        <div className="orders-list">
          {orders.length === 0 ? (
            <div className="empty-state-card">
              <div className="empty-illustration-container">
                <img src="/assets/delivery_truck.png" alt="Sin entregas" className="empty-truck-img" />
              </div>
              <h3>Sin entregas activas</h3>
              <p>Conéctate para empezar a recibir solicitudes de fincas locales y distribuidores.</p>
              <button 
                className={`start-shift-btn ${profile?.status !== 'OFFLINE' ? 'active' : ''}`}
                onClick={toggleDriverStatus}
              >
                {profile?.status === 'OFFLINE' ? 'Empezar Turno' : 'Terminar Turno'}
              </button>
            </div>
          ) : (
            orders.map(order => (
              <div key={order.id} className={`order-card status-${order.status.toLowerCase()}`}>
                {/* Order Header */}
                <div className="order-header">
                  <div className="order-id">
                    <span className="id-label">Orden #{order.order_id}</span>
                    <span className={`status-badge ${order.status.toLowerCase()}`}>
                      {getStatusLabel(order.status)}
                    </span>
                    {order.estimated_time_mins && (
                      <span className="eta-badge">{order.estimated_time_mins} min</span>
                    )}
                  </div>
                  <div className="order-customer-total">
                    <span className="fee" style={{ color: '#36EB60' }}>
                      ₡{Math.round(order.earnings_breakdown?.total_driver_payout || 0).toLocaleString()}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#9ca3af', display: 'block', textAlign: 'right', marginTop: '2px' }}>Ganancia Estimada</span>
                  </div>
                </div>

                {/* Cargo Info */}
                <div className="cargo-info light-cargo">
                  <Package size={14} />
                  <span>{order.item_count} artículos</span>
                  {order.handling_tags && (
                    <span className="heavy-badge">{order.handling_tags}</span>
                  )}
                </div>

                {/* Route */}
                <div className="order-route">
                  <div className="route-point">
                    <MapPin size={18} color="#9ca3af" />
                    <div className="address">
                      <span className="address-label">Recogida • {order.commerce_name || 'Comercio'}</span>
                      <span className="address-text">{order.pickup_address}</span>
                    </div>
                  </div>
                  <div className="route-line"></div>
                  <div className="route-point">
                    <Navigation size={18} color="#36EB60" />
                    <div className="address">
                      <span className="address-label">Entrega • Cliente</span>
                      <span className="address-text">{order.dropoff_address}</span>
                      {order.delivery_notes && (
                        <span className="delivery-notes">Nota: {order.delivery_notes}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Earnings Breakdown */}
                {(order.status === 'ASSIGNED' || order.status === 'ACCEPTED') && (
                  <EarningsBreakdown order={order} />
                )}

                {/* Actions */}
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
                    <button className="action-btn btn-success" onClick={() => setProofOrder(order)}>
                      <CheckCircle size={18} /> Confirmar Entrega
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Proof of Delivery Modal */}
      {proofOrder && (
        <ProofOfDeliveryModal
          order={proofOrder}
          onConfirm={handleDeliveryConfirm}
          onClose={() => setProofOrder(null)}
        />
      )}

      {/* Mobile Bottom Navigation Bar */}
      <nav className="mobile-bottom-nav">
        <button className="bottom-nav-item active">
          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <span>Home</span>
        </button>
        <button className="bottom-nav-item" onClick={() => { window.location.href = '/driver/orders'; }}>
          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
            <line x1="12" y1="22.08" x2="12" y2="12" />
          </svg>
          <span>Orders</span>
        </button>
        <button className="bottom-nav-item" onClick={() => { window.location.href = '/driver/earnings'; }}>
          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="4" width="20" height="16" rx="2" ry="2" />
            <line x1="12" y1="18" x2="12" y2="18.01" />
          </svg>
          <span>Earnings</span>
        </button>
        <button className="bottom-nav-item" onClick={() => { window.location.href = '/perfil'; }}>
          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span>Profile</span>
        </button>
      </nav>
    </div>
  );
};

export default DeliveryDashboard;
