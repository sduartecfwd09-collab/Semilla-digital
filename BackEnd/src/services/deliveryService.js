'use strict';
const { Op } = require('sequelize');
const {
  sequelize,
  DeliveryDriver,
  DeliveryOrder,
  DriverLocation,
  DeliveryRating,
  DeliverySetting,
  DeliveryApplication,
  DeliveryApplicationDocument,
  Usuario,
  Proforma,
} = require('../models');

// ── SETTINGS ────────────────────────────────────────────────────────────
/**
 * Get (or create) the global delivery settings singleton row.
 */
async function getSettings() {
  let settings = await DeliverySetting.findByPk(1);
  if (!settings) {
    settings = await DeliverySetting.create({ id: 1 });
  }
  return settings;
}

// ── FEE CALCULATION ─────────────────────────────────────────────────────
async function calculateDeliveryFee(distanceKm) {
  const settings = await getSettings();
  const baseCost = parseFloat(settings.base_cost);
  const kmRate = parseFloat(settings.km_rate);
  const totalCost = baseCost + (parseFloat(distanceKm) * kmRate);
  return { baseCost, kmRate, totalCost: Math.round(totalCost) };
}

// ── DRIVER PROFILE ──────────────────────────────────────────────────────
async function getDriverByUserId(userId) {
  const driver = await DeliveryDriver.findOne({
    where: { user_id: userId },
    include: [
      { model: Usuario, as: 'usuario', attributes: ['id', 'name', 'email'] },
    ],
  });
  return driver;
}

async function getAllDrivers() {
  return DeliveryDriver.findAll({
    include: [{ model: Usuario, as: 'usuario', attributes: ['id', 'name', 'email'] }],
  });
}

// ── DRIVER STATS ────────────────────────────────────────────────────────
async function getDriverStats(driverId) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [totalDelivered, deliveredToday, totalEarnings, earningsToday, activeOrders] = await Promise.all([
    // Total entregas completadas
    DeliveryOrder.count({
      where: { driver_id: driverId, status: 'DELIVERED' },
    }),
    // Entregas completadas hoy
    DeliveryOrder.count({
      where: {
        driver_id: driverId,
        status: 'DELIVERED',
        delivered_at: { [Op.gte]: today },
      },
    }),
    // Ganancias totales
    DeliveryOrder.sum('total_cost', {
      where: { driver_id: driverId, status: 'DELIVERED' },
    }),
    // Ganancias hoy
    DeliveryOrder.sum('total_cost', {
      where: {
        driver_id: driverId,
        status: 'DELIVERED',
        delivered_at: { [Op.gte]: today },
      },
    }),
    // Órdenes activas (no entregadas ni canceladas)
    DeliveryOrder.count({
      where: {
        driver_id: driverId,
        status: { [Op.notIn]: ['DELIVERED', 'CANCELLED', 'CREATED'] },
      },
    }),
  ]);

  // Rating promedio
  const driver = await DeliveryDriver.findByPk(driverId);

  return {
    totalDelivered: totalDelivered || 0,
    deliveredToday: deliveredToday || 0,
    totalEarnings: parseFloat(totalEarnings) || 0,
    earningsToday: parseFloat(earningsToday) || 0,
    activeOrders: activeOrders || 0,
    rating: driver ? parseFloat(driver.rating) : 5.0,
  };
}

// ── DRIVER ORDERS ───────────────────────────────────────────────────────
async function getDriverOrders(driverId, { status, limit, offset } = {}) {
  const where = { driver_id: driverId };
  if (status) {
    where.status = Array.isArray(status) ? { [Op.in]: status } : status;
  }

  const orders = await DeliveryOrder.findAndCountAll({
    where,
    include: [
      { model: Proforma, as: 'proforma' },
      { model: DeliveryRating, as: 'rating' },
    ],
    order: [['created_at', 'DESC']],
    limit: limit || 50,
    offset: offset || 0,
  });

  return orders;
}

// ── ALL ORDERS (admin) ──────────────────────────────────────────────────
async function getAllOrders() {
  return DeliveryOrder.findAll({
    include: [
      { model: Proforma, as: 'proforma' },
      {
        model: DeliveryDriver,
        as: 'driver',
        include: [{ model: Usuario, as: 'usuario', attributes: ['id', 'name', 'email'] }],
      },
      { model: DeliveryRating, as: 'rating' },
    ],
    order: [['created_at', 'DESC']],
  });
}

// ── SINGLE ORDER ────────────────────────────────────────────────────────
async function getOrderById(orderId) {
  return DeliveryOrder.findByPk(orderId, {
    include: [
      { model: Proforma, as: 'proforma' },
      {
        model: DeliveryDriver,
        as: 'driver',
        include: [{ model: Usuario, as: 'usuario', attributes: ['id', 'name', 'email'] }],
      },
      { model: DeliveryRating, as: 'rating' },
    ],
  });
}

// ── CREATE ORDER ────────────────────────────────────────────────────────
async function createOrder({ order_id, pickup_address, pickup_lat, pickup_lng, dropoff_address, dropoff_lat, dropoff_lng, distance_km }) {
  const fee = await calculateDeliveryFee(distance_km || 0);

  const order = await DeliveryOrder.create({
    order_id,
    pickup_address,
    pickup_lat,
    pickup_lng,
    dropoff_address,
    dropoff_lat,
    dropoff_lng,
    distance_km,
    base_cost: fee.baseCost,
    km_rate: fee.kmRate,
    total_cost: fee.totalCost,
    status: 'PENDING',
  });

  return order;
}

// ── UPDATE ORDER STATUS ─────────────────────────────────────────────────
async function updateOrderStatus(orderId, newStatus, driverId = null) {
  const order = await DeliveryOrder.findByPk(orderId);
  if (!order) return null;

  // Validate status transition
  const validTransitions = {
    CREATED: ['PENDING'],
    PENDING: ['QUEUED', 'ASSIGNED', 'CANCELLED'],
    QUEUED: ['ASSIGNED', 'CANCELLED'],
    ASSIGNED: ['ACCEPTED', 'PENDING', 'CANCELLED'],  // PENDING = rejection/timeout
    ACCEPTED: ['PICKED_UP', 'CANCELLED'],
    PICKED_UP: ['IN_TRANSIT'],
    IN_TRANSIT: ['DELIVERED'],
    MANUAL_REVIEW: ['ASSIGNED', 'CANCELLED'],
  };

  const allowed = validTransitions[order.status] || [];
  if (!allowed.includes(newStatus)) {
    throw new Error(`Transición inválida: ${order.status} → ${newStatus}`);
  }

  order.status = newStatus;

  // Set timestamps
  const now = new Date();
  if (newStatus === 'ASSIGNED') order.assigned_at = now;
  if (newStatus === 'ACCEPTED') order.accepted_at = now;
  if (newStatus === 'PICKED_UP') order.picked_up_at = now;
  if (newStatus === 'DELIVERED') order.delivered_at = now;

  await order.save();
  return order;
}

// ── ACCEPT ORDER ────────────────────────────────────────────────────────
async function acceptOrder(orderId, driverId) {
  const order = await DeliveryOrder.findByPk(orderId);
  if (!order) throw new Error('Orden no encontrada');
  if (order.driver_id !== driverId) throw new Error('Esta orden no te fue asignada');
  if (order.status !== 'ASSIGNED') throw new Error('Esta orden ya no está disponible para aceptar');

  order.status = 'ACCEPTED';
  order.accepted_at = new Date();
  await order.save();

  // Increment active orders on driver
  await DeliveryDriver.increment('active_orders', { where: { id: driverId } });

  return order;
}

// ── REJECT ORDER (driver declines) ──────────────────────────────────────
async function rejectOrder(orderId, driverId) {
  const order = await DeliveryOrder.findByPk(orderId);
  if (!order) throw new Error('Orden no encontrada');
  if (order.driver_id !== driverId) throw new Error('Esta orden no te fue asignada');

  order.driver_id = null;
  order.status = 'PENDING';
  order.assignment_attempts += 1;
  await order.save();

  return order;
}

// ── SUBMIT RATING ───────────────────────────────────────────────────────
async function submitRating(deliveryOrderId, score, comment) {
  // Check if already rated
  const existing = await DeliveryRating.findOne({ where: { delivery_order_id: deliveryOrderId } });
  if (existing) throw new Error('Esta entrega ya fue calificada');

  const order = await DeliveryOrder.findByPk(deliveryOrderId);
  if (!order) throw new Error('Orden no encontrada');
  if (order.status !== 'DELIVERED') throw new Error('Solo se pueden calificar entregas completadas');

  const rating = await DeliveryRating.create({
    delivery_order_id: deliveryOrderId,
    score,
    comment,
  });

  // Recalculate driver's average rating
  if (order.driver_id) {
    const allRatings = await DeliveryRating.findAll({
      include: [{
        model: DeliveryOrder,
        as: 'order',
        where: { driver_id: order.driver_id },
        attributes: [],
      }],
    });

    const avg = allRatings.reduce((sum, r) => sum + r.score, 0) / allRatings.length;
    await DeliveryDriver.update(
      { rating: Math.round(avg * 100) / 100 },
      { where: { id: order.driver_id } }
    );
  }

  return rating;
}

// ── DRIVER EARNINGS ─────────────────────────────────────────────────────
async function getDriverEarnings(driverId) {
  const now = new Date();

  // Start of today
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  // Start of this week (Monday)
  const startOfWeek = new Date(now);
  const dayOfWeek = startOfWeek.getDay() || 7; // Sunday = 7
  startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek + 1);
  startOfWeek.setHours(0, 0, 0, 0);

  // Start of this month
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [todayEarnings, weekEarnings, monthEarnings, todayCount, weekCount, monthCount, recentDeliveries] = await Promise.all([
    DeliveryOrder.sum('total_cost', { where: { driver_id: driverId, status: 'DELIVERED', delivered_at: { [Op.gte]: startOfToday } } }),
    DeliveryOrder.sum('total_cost', { where: { driver_id: driverId, status: 'DELIVERED', delivered_at: { [Op.gte]: startOfWeek } } }),
    DeliveryOrder.sum('total_cost', { where: { driver_id: driverId, status: 'DELIVERED', delivered_at: { [Op.gte]: startOfMonth } } }),
    DeliveryOrder.count({ where: { driver_id: driverId, status: 'DELIVERED', delivered_at: { [Op.gte]: startOfToday } } }),
    DeliveryOrder.count({ where: { driver_id: driverId, status: 'DELIVERED', delivered_at: { [Op.gte]: startOfWeek } } }),
    DeliveryOrder.count({ where: { driver_id: driverId, status: 'DELIVERED', delivered_at: { [Op.gte]: startOfMonth } } }),
    DeliveryOrder.findAll({
      where: { driver_id: driverId, status: 'DELIVERED' },
      order: [['delivered_at', 'DESC']],
      limit: 20,
      include: [{ model: DeliveryRating, as: 'rating' }],
    }),
  ]);

  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const deliveriesLast7Days = await DeliveryOrder.findAll({
    where: {
      driver_id: driverId,
      status: 'DELIVERED',
      delivered_at: { [Op.gte]: sevenDaysAgo }
    },
    attributes: ['total_cost', 'delivered_at']
  });

  const weeklyChartData = Array(7).fill(0).map((_, i) => {
    const d = new Date(sevenDaysAgo);
    d.setDate(d.getDate() + i);
    return {
      date: d.toLocaleDateString('es-CR', { weekday: 'short', day: 'numeric' }),
      earnings: 0
    };
  });

  deliveriesLast7Days.forEach(order => {
    const d = new Date(order.delivered_at);
    d.setHours(0, 0, 0, 0);
    const diffDays = Math.round((d - sevenDaysAgo) / (1000 * 60 * 60 * 24));
    if (diffDays >= 0 && diffDays < 7) {
      weeklyChartData[diffDays].earnings += parseFloat(order.total_cost) || 0;
    }
  });

  return {
    today: { earnings: parseFloat(todayEarnings) || 0, count: todayCount || 0 },
    week: { earnings: parseFloat(weekEarnings) || 0, count: weekCount || 0 },
    month: { earnings: parseFloat(monthEarnings) || 0, count: monthCount || 0 },
    recentDeliveries,
    weeklyChartData,
  };
}

module.exports = {
  getSettings,
  calculateDeliveryFee,
  getDriverByUserId,
  getAllDrivers,
  getDriverStats,
  getDriverOrders,
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  acceptOrder,
  rejectOrder,
  submitRating,
  getDriverEarnings,
};
