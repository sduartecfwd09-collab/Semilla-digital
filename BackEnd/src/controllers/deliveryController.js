'use strict';
const deliveryService = require('../services/deliveryService');
const { DeliveryDriver, DeliveryOrder, Usuario } = require('../models');
const socket = require('../socket');

// ── SETTINGS ────────────────────────────────────────────────────────────
exports.getSettings = async (req, res, next) => {
  try {
    const settings = await deliveryService.getSettings();
    res.json({ success: true, data: settings });
  } catch (error) { next(error); }
};

// ── DRIVERS ─────────────────────────────────────────────────────────────
exports.getDrivers = async (req, res, next) => {
  try {
    const drivers = await deliveryService.getAllDrivers();
    res.json({ success: true, data: drivers });
  } catch (error) { next(error); }
};

exports.getMyDriverProfile = async (req, res, next) => {
  try {
    const driver = await deliveryService.getDriverByUserId(req.user.id);
    if (!driver) {
      return res.status(404).json({ success: false, message: 'No estás registrado como repartidor.' });
    }
    res.json({ success: true, data: driver });
  } catch (error) { next(error); }
};

exports.getMyStats = async (req, res, next) => {
  try {
    const driver = await deliveryService.getDriverByUserId(req.user.id);
    if (!driver) {
      return res.status(404).json({ success: false, message: 'No estás registrado como repartidor.' });
    }
    const stats = await deliveryService.getDriverStats(driver.id);
    res.json({ success: true, data: stats });
  } catch (error) { next(error); }
};

exports.getMyOrders = async (req, res, next) => {
  try {
    const driver = await deliveryService.getDriverByUserId(req.user.id);
    if (!driver) {
      return res.status(404).json({ success: false, message: 'No estás registrado como repartidor.' });
    }
    const { status, limit, offset } = req.query;
    const statusArray = status ? status.split(',') : undefined;
    const orders = await deliveryService.getDriverOrders(driver.id, {
      status: statusArray,
      limit: parseInt(limit) || 50,
      offset: parseInt(offset) || 0,
    });
    res.json({ success: true, data: orders.rows, total: orders.count });
  } catch (error) { next(error); }
};

exports.getMyEarnings = async (req, res, next) => {
  try {
    const driver = await deliveryService.getDriverByUserId(req.user.id);
    if (!driver) {
      return res.status(404).json({ success: false, message: 'No estás registrado como repartidor.' });
    }
    const earnings = await deliveryService.getDriverEarnings(driver.id);
    res.json({ success: true, data: earnings });
  } catch (error) { next(error); }
};

exports.registerDriver = async (req, res, next) => {
  try {
    const { user_id } = req.body;
    let driver = await DeliveryDriver.findOne({ where: { user_id } });
    if (driver) {
      return res.status(400).json({ success: false, message: 'El usuario ya está registrado como driver.' });
    }
    driver = await DeliveryDriver.create({ user_id, status: 'OFFLINE' });
    res.status(201).json({ success: true, data: driver });
  } catch (error) { next(error); }
};

exports.updateDriverStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['OFFLINE', 'AVAILABLE', 'BUSY'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Estado inválido. Usa: ${validStatuses.join(', ')}` });
    }

    const driver = await deliveryService.getDriverByUserId(req.user.id);
    if (!driver) return res.status(404).json({ success: false, message: 'Driver no encontrado' });

    driver.status = status;
    await driver.save();
    res.json({ success: true, data: driver });
  } catch (error) { next(error); }
};

// ── ORDERS ──────────────────────────────────────────────────────────────
exports.getOrders = async (req, res, next) => {
  try {
    const orders = await deliveryService.getAllOrders();
    res.json({ success: true, data: orders });
  } catch (error) { next(error); }
};

exports.getOrderById = async (req, res, next) => {
  try {
    const order = await deliveryService.getOrderById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Orden no encontrada' });
    res.json({ success: true, data: order });
  } catch (error) { next(error); }
};

exports.createOrder = async (req, res, next) => {
  try {
    const { order_id, pickup_address, pickup_lat, pickup_lng, dropoff_address, dropoff_lat, dropoff_lng, distance_km, cargo_weight, supplements, tips } = req.body;

    if (!pickup_address || !dropoff_address) {
      return res.status(400).json({ success: false, message: 'Faltan datos obligatorios (pickup_address, dropoff_address)' });
    }

    const order = await deliveryService.createOrder({
      order_id,
      pickup_address,
      pickup_lat,
      pickup_lng,
      dropoff_address,
      dropoff_lat,
      dropoff_lng,
      distance_km: distance_km || 0,
      cargo_weight: cargo_weight || 0,
      supplements: supplements || 0,
      tips: tips || 0,
    });

    // Dispatch BullMQ job (if available)
    try {
      const { distributionQueue } = require('../jobs/distributionWorker');
      await distributionQueue.add('distribute', { orderId: order.id, retryCount: 0 });
    } catch (e) {
      console.log('[Delivery] BullMQ no disponible, la orden requiere asignación manual.');
    }

    res.status(201).json({ success: true, data: order, message: 'Orden creada y encolada para distribución.' });
  } catch (error) { next(error); }
};

exports.assignOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { driver_id } = req.body;
    const order = await DeliveryOrder.findByPk(id);
    if (!order) return res.status(404).json({ success: false, message: 'Orden no encontrada' });

    order.driver_id = driver_id;
    order.status = 'ASSIGNED';
    order.assigned_at = new Date();
    await order.save();

    try {
      socket.getIO().to(`order_${id}`).emit('orderStatusUpdated', { orderId: id, status: 'ASSIGNED', driverId: driver_id });
      socket.getIO().to(`driver_${driver_id}`).emit('newOrderAssigned', { orderId: id });
    } catch (e) { /* socket not initialized */ }

    res.json({ success: true, data: order });
  } catch (error) { next(error); }
};

exports.acceptOrderByDriver = async (req, res, next) => {
  try {
    const driver = await deliveryService.getDriverByUserId(req.user.id);
    if (!driver) return res.status(404).json({ success: false, message: 'No sos repartidor' });

    const order = await deliveryService.acceptOrder(req.params.id, driver.id);

    try {
      socket.getIO().to(`order_${order.id}`).emit('orderStatusUpdated', {
        orderId: order.id,
        status: 'ACCEPTED',
        driverId: driver.id,
        driverName: driver.usuario ? driver.usuario.name : 'Repartidor',
      });
    } catch (e) { /* socket */ }

    res.json({ success: true, data: order });
  } catch (error) {
    if (error.message.includes('no encontrada') || error.message.includes('no te fue') || error.message.includes('no está disponible')) {
      return res.status(400).json({ success: false, message: error.message });
    }
    next(error);
  }
};

exports.rejectOrderByDriver = async (req, res, next) => {
  try {
    const driver = await deliveryService.getDriverByUserId(req.user.id);
    if (!driver) return res.status(404).json({ success: false, message: 'No sos repartidor' });

    const order = await deliveryService.rejectOrder(req.params.id, driver.id);

    // Re-queue for distribution
    try {
      const { distributionQueue } = require('../jobs/distributionWorker');
      await distributionQueue.add('distribute', { orderId: order.id, retryCount: order.assignment_attempts });
    } catch (e) {
      console.log('[Delivery] BullMQ no disponible para re-asignación.');
    }

    res.json({ success: true, data: order, message: 'Orden rechazada y re-encolada.' });
  } catch (error) {
    if (error.message.includes('no encontrada') || error.message.includes('no te fue')) {
      return res.status(400).json({ success: false, message: error.message });
    }
    next(error);
  }
};

exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, proof_of_delivery_url } = req.body;

    const order = await deliveryService.updateOrderStatus(id, status, proof_of_delivery_url);
    if (!order) return res.status(404).json({ success: false, message: 'Orden no encontrada' });

    // If delivered, decrement active orders on driver
    if (status === 'DELIVERED' && order.driver_id) {
      await DeliveryDriver.decrement('active_orders', {
        where: { id: order.driver_id },
      });
    }

    try {
      socket.getIO().to(`order_${id}`).emit('orderStatusUpdated', { orderId: id, status });
    } catch (e) { /* socket */ }

    res.json({ success: true, data: order });
  } catch (error) {
    if (error.message.includes('Transición inválida')) {
      return res.status(400).json({ success: false, message: error.message });
    }
    next(error);
  }
};

// ── LOCATIONS ───────────────────────────────────────────────────────────
const { DriverLocation } = require('../models');

exports.updateLocation = async (req, res, next) => {
  try {
    const { lat, lng } = req.body;
    const driver = await deliveryService.getDriverByUserId(req.user.id);
    if (!driver) return res.status(404).json({ success: false, message: 'Driver no encontrado' });

    // Save location history
    const location = await DriverLocation.create({ driver_id: driver.id, lat, lng });

    // Update current position on driver
    driver.current_lat = lat;
    driver.current_lng = lng;
    await driver.save();

    try {
      // Broadcast to all active orders of this driver
      const activeOrders = await DeliveryOrder.findAll({
        where: {
          driver_id: driver.id,
          status: ['ACCEPTED', 'PICKED_UP', 'IN_TRANSIT'],
        },
      });
      const io = socket.getIO();
      activeOrders.forEach(order => {
        io.to(`order_${order.id}`).emit('driverLocationUpdated', { driverId: driver.id, lat, lng });
      });
    } catch (e) { /* socket */ }

    res.status(201).json({ success: true, data: location });
  } catch (error) { next(error); }
};

exports.getDriverLocation = async (req, res, next) => {
  try {
    const { driver_id } = req.params;
    const driver = await DeliveryDriver.findByPk(driver_id);
    if (!driver) return res.status(404).json({ success: false, message: 'Driver no encontrado' });

    res.json({
      success: true,
      data: {
        lat: driver.current_lat,
        lng: driver.current_lng,
      },
    });
  } catch (error) { next(error); }
};

// ── RATINGS ─────────────────────────────────────────────────────────────
exports.rateDelivery = async (req, res, next) => {
  try {
    const { delivery_order_id, score, comment } = req.body;

    if (!delivery_order_id || !score) {
      return res.status(400).json({ success: false, message: 'delivery_order_id y score son requeridos' });
    }
    if (score < 1 || score > 5) {
      return res.status(400).json({ success: false, message: 'El score debe ser entre 1 y 5' });
    }

    const rating = await deliveryService.submitRating(delivery_order_id, score, comment);
    res.status(201).json({ success: true, data: rating });
  } catch (error) {
    if (error.message.includes('ya fue calificada') || error.message.includes('no encontrada') || error.message.includes('Solo se pueden')) {
      return res.status(400).json({ success: false, message: error.message });
    }
    next(error);
  }
};

// ── CALCULATE FEE (public endpoint) ─────────────────────────────────────
exports.calculateFee = async (req, res, next) => {
  try {
    const { distance_km, cargo_weight, supplements } = req.query;
    if (!distance_km) {
      return res.status(400).json({ success: false, message: 'distance_km es requerido' });
    }
    const fee = await deliveryService.calculateDeliveryFee(parseFloat(distance_km), parseFloat(cargo_weight) || 0, parseFloat(supplements) || 0);
    res.json({ success: true, data: fee });
  } catch (error) { next(error); }
};
