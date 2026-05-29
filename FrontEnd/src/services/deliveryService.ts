import { ENDPOINTS, authFetch } from './api.config';

export interface DriverProfile {
  id: string;
  user_id: number;
  status: 'OFFLINE' | 'AVAILABLE' | 'BUSY';
  current_lat: number | null;
  current_lng: number | null;
  rating: number;
  active_orders: number;
  max_orders: number;
  accumulated_balance: number;
  usuario: {
    id: number;
    name: string;
    email: string;
  };
}

export interface DriverStats {
  totalDelivered: number;
  deliveredToday: number;
  totalEarnings: number;
  earningsToday: number;
  activeOrders: number;
  rating: number;
}

export interface DriverEarningsData {
  id?: string;
  base_pickup_fee: number;
  base_dropoff_fee: number;
  distance_fee: number;
  time_fee: number;
  surge_multiplier: number;
  gross_earnings: number;
  platform_commission_pct: number;
  platform_fee: number;
  net_earnings: number;
  tips: number;
  total_driver_payout: number;
}

export interface DeliveryOrder {
  id: string;
  order_id: string;
  driver_id: string | null;
  status: 'CREATED' | 'PENDING' | 'QUEUED' | 'ASSIGNED' | 'ACCEPTED' | 'PICKED_UP' | 'IN_TRANSIT' | 'DELIVERED' | 'MANUAL_REVIEW' | 'CANCELLED';
  
  commerce_name: string | null;
  pickup_address: string;
  pickup_lat: number | null;
  pickup_lng: number | null;
  
  dropoff_address: string;
  dropoff_lat: number | null;
  dropoff_lng: number | null;
  delivery_notes: string | null;
  
  item_count: number | null;
  handling_tags: string | null;
  
  distance_km: number | null;
  estimated_time_mins: number | null;
  
  subtotal_items: number | null;
  delivery_fee: number | null;
  total_customer_cost: number | null;
  tips: number | null;
  
  earnings_breakdown?: DriverEarningsData; // Fetched with relation
  
  proof_of_delivery_url: string | null;
  created_at: string;
  proforma?: any;
  rating?: any;
}

export interface DeliveryEarnings {
  today: { earnings: number; count: number };
  week: { earnings: number; count: number };
  month: { earnings: number; count: number };
  recentDeliveries: any[];
  weeklyChartData: { date: string; earnings: number }[];
}

export interface EarningsParams {
  distanceKm: number;
  estimatedTimeMins: number;
  surgeMultiplier?: number;
  tips?: number;
  rates?: {
    pickupBase: number;
    dropoffBase: number;
    perKm: number;
    perMinute: number;
    platformCommissionPct: number;
  };
}

export function calculateDriverEarnings(params: EarningsParams): DriverEarningsData {
  const rates = params.rates || {
    pickupBase: 350,   // ₡350 por recoger
    dropoffBase: 250,  // ₡250 por entregar
    perKm: 300,        // ₡300 por kilómetro
    perMinute: 35,     // ₡35 por minuto estimado
    platformCommissionPct: 0.20 // 20% de comisión
  };
  
  const surge = params.surgeMultiplier || 1.0;
  const tips = params.tips || 0;

  const base_pickup_fee = rates.pickupBase;
  const base_dropoff_fee = rates.dropoffBase;
  const distance_fee = params.distanceKm * rates.perKm;
  const time_fee = params.estimatedTimeMins * rates.perMinute;

  const subtotal = base_pickup_fee + base_dropoff_fee + distance_fee + time_fee;
  const gross_earnings = subtotal * surge;

  const platform_fee = gross_earnings * rates.platformCommissionPct;
  const net_earnings = gross_earnings - platform_fee;
  const total_driver_payout = net_earnings + tips;

  return {
    base_pickup_fee,
    base_dropoff_fee,
    distance_fee,
    time_fee,
    surge_multiplier: surge,
    gross_earnings,
    platform_commission_pct: rates.platformCommissionPct,
    platform_fee,
    net_earnings,
    tips,
    total_driver_payout
  };
}

export const deliveryService = {
  // REPARTIDOR ENDPOINTS
  getMyProfile: async (): Promise<DriverProfile> => {
    const res = await authFetch(`${ENDPOINTS.delivery}/drivers/me`);
    if (!res.ok) throw new Error('Error al obtener perfil de driver');
    const json = await res.json();
    return json.data;
  },

  getMyStats: async (): Promise<DriverStats> => {
    const res = await authFetch(`${ENDPOINTS.delivery}/drivers/me/stats`);
    if (!res.ok) throw new Error('Error al obtener estadísticas');
    const json = await res.json();
    return json.data;
  },

  getMyOrders: async (status?: string): Promise<{ data: DeliveryOrder[]; total: number }> => {
    const url = status 
      ? `${ENDPOINTS.delivery}/drivers/me/orders?status=${status}`
      : `${ENDPOINTS.delivery}/drivers/me/orders`;
    const res = await authFetch(url);
    if (!res.ok) throw new Error('Error al obtener pedidos');
    const json = await res.json();
    return { data: json.data, total: json.total };
  },

  getMyEarnings: async (): Promise<DeliveryEarnings> => {
    const res = await authFetch(`${ENDPOINTS.delivery}/drivers/me/earnings`);
    if (!res.ok) throw new Error('Error al obtener ganancias');
    const json = await res.json();
    return json.data;
  },

  updateDriverStatus: async (status: 'OFFLINE' | 'AVAILABLE' | 'BUSY'): Promise<void> => {
    const res = await authFetch(`${ENDPOINTS.delivery}/drivers/me/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error('Error al actualizar estado');
  },

  updateLocation: async (lat: number, lng: number): Promise<void> => {
    await authFetch(`${ENDPOINTS.delivery}/locations`, {
      method: 'POST',
      body: JSON.stringify({ lat, lng })
    });
  },

  // ORDER ACTIONS
  acceptOrder: async (orderId: string): Promise<DeliveryOrder> => {
    const res = await authFetch(`${ENDPOINTS.delivery}/orders/${orderId}/accept`, {
      method: 'POST'
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.message || 'Error al aceptar pedido');
    return json.data;
  },

  rejectOrder: async (orderId: string): Promise<void> => {
    const res = await authFetch(`${ENDPOINTS.delivery}/orders/${orderId}/reject`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error('Error al rechazar pedido');
  },

  updateOrderStatus: async (orderId: string, status: string, proofOfDeliveryUrl?: string): Promise<void> => {
    const body: Record<string, string> = { status };
    if (proofOfDeliveryUrl) body.proof_of_delivery_url = proofOfDeliveryUrl;
    const res = await authFetch(`${ENDPOINTS.delivery}/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error('Error al actualizar estado del pedido');
  },

  // CLIENT ENDPOINTS
  getOrderById: async (orderId: string): Promise<DeliveryOrder> => {
    const res = await authFetch(`${ENDPOINTS.delivery}/orders/${orderId}`);
    if (!res.ok) throw new Error('Error al obtener el pedido');
    const json = await res.json();
    return json.data;
  },

  submitRating: async (orderId: string, score: number, comment?: string): Promise<void> => {
    const res = await authFetch(`${ENDPOINTS.delivery}/ratings`, {
      method: 'POST',
      body: JSON.stringify({ delivery_order_id: orderId, score, comment })
    });
    if (!res.ok) throw new Error('Error al enviar calificación');
  }
};
