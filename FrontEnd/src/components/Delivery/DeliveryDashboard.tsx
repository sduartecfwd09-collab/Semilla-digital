import React, { useState, useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import Swal from 'sweetalert2';
import {
  Truck, MapPin, CheckCircle, Navigation, Star, TrendingUp,
  Package, XCircle, DollarSign, Weight, Camera, PenTool, X, Upload, Wallet
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

  const loadMockData = () => {
    setProfile({
      id: 'mock-driver-1',
      user_id: 999,
      status: 'AVAILABLE',
      current_lat: 9.9281,
      current_lng: -84.0907,
      rating: 4.8,
      active_orders: 4,
      max_orders: 5,
      accumulated_balance: 15400,
      usuario: { id: 999, name: 'Repartidor de Prueba', email: 'test@delivery.com' }
    });
    setStats({
      totalDelivered: 45,
      deliveredToday: 5,
      totalEarnings: 150000,
      earningsToday: 15400,
      activeOrders: 4,
      rating: 4.8
    });

    const o1Params: EarningsParams = { distanceKm: 5.2, estimatedTimeMins: 15, surgeMultiplier: 1.2, tips: 1000 };
    const e1 = calculateDriverEarnings(o1Params);

    const o2Params: EarningsParams = { distanceKm: 2.5, estimatedTimeMins: 8, surgeMultiplier: 1.0, tips: 0 };
    const e2 = calculateDriverEarnings(o2Params);

    const o3Params: EarningsParams = { distanceKm: 8.0, estimatedTimeMins: 25, surgeMultiplier: 1.5, tips: 500 };
    const e3 = calculateDriverEarnings(o3Params);

    const o4Params: EarningsParams = { distanceKm: 1.5, estimatedTimeMins: 5, surgeMultiplier: 1.0, tips: 0 };
    const e4 = calculateDriverEarnings(o4Params);

    setOrders([
      {
        id: 'order-mock-1', order_id: 'ORD-9001', driver_id: 'mock-driver-1', status: 'ASSIGNED',
        commerce_name: 'Restaurante El Buen Sabor',
        pickup_address: 'Plaza Central, Local 4, San José', pickup_lat: 9.9322, pickup_lng: -84.0795,
        dropoff_address: 'Condominio Las Vistas, Torre 2', dropoff_lat: 9.9981, dropoff_lng: -84.1198,
        delivery_notes: 'Dejar en recepción por favor. No tocar timbre.',
        item_count: 3, handling_tags: 'Bebidas, Comida Caliente',
        distance_km: o1Params.distanceKm, estimated_time_mins: o1Params.estimatedTimeMins,
        subtotal_items: 12500, delivery_fee: 2500, total_customer_cost: 16000, tips: o1Params.tips!,
        earnings_breakdown: e1,
        proof_of_delivery_url: null, created_at: new Date().toISOString()
      },
      {
        id: 'order-mock-2', order_id: 'ORD-9002', driver_id: 'mock-driver-1', status: 'ACCEPTED',
        commerce_name: 'Farmacia La Salud',
        pickup_address: 'Av 2, Calle 5, Heredia', pickup_lat: 10.323, pickup_lng: -84.432,
        dropoff_address: 'Residencial Los Álamos', dropoff_lat: 10.330, dropoff_lng: -84.440,
        delivery_notes: null,
        item_count: 1, handling_tags: 'Medicamentos',
        distance_km: o2Params.distanceKm, estimated_time_mins: o2Params.estimatedTimeMins,
        subtotal_items: 8000, delivery_fee: 1500, total_customer_cost: 9500, tips: o2Params.tips!,
        earnings_breakdown: e2,
        proof_of_delivery_url: null, created_at: new Date().toISOString()
      },
      {
        id: 'order-mock-3', order_id: 'ORD-9003', driver_id: 'mock-driver-1', status: 'PICKED_UP',
        commerce_name: 'Floristería Paraíso',
        pickup_address: 'Centro Comercial Escazú', pickup_lat: 10.0159, pickup_lng: -84.2140,
        dropoff_address: 'Edificio Empresarial, Piso 3', dropoff_lat: 10.0259, dropoff_lng: -84.2240,
        delivery_notes: 'Entregar a la secretaria',
        item_count: 2, handling_tags: 'Frágil, Flores',
        distance_km: o3Params.distanceKm, estimated_time_mins: o3Params.estimatedTimeMins,
        subtotal_items: 25000, delivery_fee: 3000, total_customer_cost: 28500, tips: o3Params.tips!,
        earnings_breakdown: e3,
        proof_of_delivery_url: null, created_at: new Date().toISOString()
      },
      {
        id: 'order-mock-4', order_id: 'ORD-9004', driver_id: 'mock-driver-1', status: 'IN_TRANSIT',
        commerce_name: 'Cafetería Central',
        pickup_address: 'Frente al Parque Morazán', pickup_lat: 9.998, pickup_lng: -84.111,
        dropoff_address: 'Oficinas Gubernamentales', dropoff_lat: 9.950, dropoff_lng: -84.050,
        delivery_notes: 'Llamar al llegar',
        item_count: 1, handling_tags: 'Líquidos',
        distance_km: o4Params.distanceKm, estimated_time_mins: o4Params.estimatedTimeMins,
        subtotal_items: 4500, delivery_fee: 1200, total_customer_cost: 5700, tips: o4Params.tips!,
        earnings_breakdown: e4,
        proof_of_delivery_url: null, created_at: new Date().toISOString()
      }
    ]);
  };

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
      if (orderId.includes('mock')) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'ACCEPTED' } : o));
        Swal.fire({ icon: 'success', title: 'Pedido Aceptado', toast: true, position: 'top-end', timer: 3000, showConfirmButton: false });
        return;
      }
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
      if (orderId.includes('mock')) {
        setOrders(prev => prev.filter(o => o.id !== orderId));
        return;
      }
      await deliveryService.rejectOrder(orderId);
      fetchDashboardData();
    } catch (error: any) {
      Swal.fire({ icon: 'error', title: 'Error', text: error.message });
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      if (orderId.includes('mock')) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus as any } : o));
        return;
      }
      await deliveryService.updateOrderStatus(orderId, newStatus);
      fetchDashboardData();
    } catch (error: any) {
      Swal.fire({ icon: 'error', title: 'Error', text: error.message });
    }
  };

  const handleDeliveryConfirm = async (proofUrl: string) => {
    if (!proofOrder) return;
    try {
      if (proofOrder.id.includes('mock')) {
        setOrders(prev => prev.filter(o => o.id !== proofOrder.id));
        setProofOrder(null);
        Swal.fire({
          icon: 'success',
          title: '¡Entrega Completada!',
          html: `Tu ganancia neta de <strong>₡${Math.round(proofOrder.earnings_breakdown?.total_driver_payout ?? 0).toLocaleString()}</strong> fue acreditada a tu saldo.`,
          background: '#1b2a1e',
          color: '#fff',
          confirmButtonColor: '#36EB60',
        });
        return;
      }
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
      {/* Header */}
      <header className="dashboard-header">
        <div>
          <h1 className="greeting">Hola, {profile?.usuario?.name || 'Repartidor'}</h1>
          <p className="subtitle">Aquí tienes el resumen de tu actividad de hoy.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button onClick={loadMockData} style={{ background: '#36EB60', color: '#1b2a1e', border: 'none', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
            Cargar Datos de Prueba
          </button>
          <div className="status-toggle-container">
            <span className="status-label">{profile?.status === 'OFFLINE' ? 'Desconectado' : 'Conectado'}</span>
            <label className="switch">
              <input type="checkbox" checked={profile?.status !== 'OFFLINE'} onChange={toggleDriverStatus} />
              <span className="slider round"></span>
            </label>
          </div>
        </div>
      </header>

      {/* Stats Grid */}
      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper blue"><Package size={24} /></div>
          <div className="stat-info">
            <h3>{stats?.deliveredToday || 0}</h3>
            <p>Entregas Hoy</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper green"><TrendingUp size={24} /></div>
          <div className="stat-info">
            <h3>₡{(stats?.earningsToday || 0).toLocaleString()}</h3>
            <p>Ganancias Hoy</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper yellow"><Star size={24} /></div>
          <div className="stat-info">
            <h3>{(stats?.rating || 5.0).toFixed(1)}</h3>
            <p>Calificación</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper purple"><Wallet size={24} /></div>
          <div className="stat-info">
            <h3>₡{(profile?.accumulated_balance || 0).toLocaleString()}</h3>
            <p>Saldo Acumulado</p>
          </div>
        </div>
      </section>

      {/* Active Orders */}
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

                {/* Earnings Breakdown (shown when ASSIGNED so driver can decide) */}
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
    </div>
  );
};

export default DeliveryDashboard;
