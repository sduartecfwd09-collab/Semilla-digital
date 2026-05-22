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

export interface DeliveryOrder {
  id: string;
  order_id: string;
  driver_id: string | null;
  status: 'CREATED' | 'PENDING' | 'QUEUED' | 'ASSIGNED' | 'ACCEPTED' | 'PICKED_UP' | 'IN_TRANSIT' | 'DELIVERED' | 'MANUAL_REVIEW' | 'CANCELLED';
  pickup_address: string;
  pickup_lat: number | null;
  pickup_lng: number | null;
  dropoff_address: string;
  dropoff_lat: number | null;
  dropoff_lng: number | null;
  distance_km: number | null;
  eta_minutes: number | null;
  base_cost: number | null;
  km_rate: number | null;
  total_cost: number | null;
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

export const deliveryService = {
  // DRIVER ENDPOINTS
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
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al aceptar pedido');
    }
    const json = await res.json();
    return json.data;
  },

  rejectOrder: async (orderId: string): Promise<void> => {
    const res = await authFetch(`${ENDPOINTS.delivery}/orders/${orderId}/reject`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error('Error al rechazar pedido');
  },

  updateOrderStatus: async (orderId: string, status: string): Promise<void> => {
    const res = await authFetch(`${ENDPOINTS.delivery}/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
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
