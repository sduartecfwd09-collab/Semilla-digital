'use strict';
const { DeliveryDriver, DeliveryOrder, DriverLocation, DeliveryRating, Usuario, Proforma } = require('../models');
const socket = require('../socket');

// ── DRIVERS ─────────────────────────────────────────────────────────────
exports.getDrivers = async (req, res, next) => {
  try {
    const drivers = await DeliveryDriver.findAll({
      include: [{ model: Usuario, as: 'usuario', attributes: ['id', 'name', 'email'] }]
    });
    res.json({ success: true, data: drivers });
  } catch (error) { next(error); }
};

exports.registerDriver = async (req, res, next) => {
  try {
    const { usuario_id, vehicle_type, license_plate } = req.body;
    let driver = await DeliveryDriver.findOne({ where: { usuario_id } });
    if (driver) {
      return res.status(400).json({ success: false, message: 'El usuario ya está registrado como driver.' });
    }
    driver = await DeliveryDriver.create({ usuario_id, vehicle_type, license_plate, status: 'active' });
    res.status(201).json({ success: true, data: driver });
  } catch (error) { next(error); }
};

exports.updateDriverStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const { id } = req.params;
    const driver = await DeliveryDriver.findByPk(id);
    if (!driver) return res.status(404).json({ success: false, message: 'Driver no encontrado' });
    
    driver.status = status;
    await driver.save();
    res.json({ success: true, data: driver });
  } catch (error) { next(error); }
};

const { distributionQueue } = require('../jobs/distributionWorker');

// ── ORDERS ──────────────────────────────────────────────────────────────
exports.getOrders = async (req, res, next) => {
  try {
    const orders = await DeliveryOrder.findAll({
      include: [
        { model: Proforma, as: 'proforma' },
        { model: DeliveryDriver, as: 'driver', include: [{ model: Usuario, as: 'usuario', attributes: ['id', 'name'] }] }
      ]
    });
    res.json({ success: true, data: orders });
  } catch (error) { next(error); }
};

exports.createOrder = async (req, res, next) => {
  try {
    const { proforma_id, pickup_address, delivery_address, distancia_km } = req.body;

    if (!pickup_address || !delivery_address || distancia_km === undefined) {
      return res.status(400).json({ success: false, message: 'Faltan datos obligatorios (pickup_address, delivery_address, distancia_km)' });
    }

    // Cálculo de tarifa
    const costo_base = 1500;
    const tarifa_por_km = 500;
    const delivery_fee = costo_base + (parseFloat(distancia_km) * tarifa_por_km);

    const order = await DeliveryOrder.create({ 
      proforma_id, 
      pickup_address, 
      delivery_address, 
      delivery_fee 
    });

    // Despachar el Job a BullMQ
    await distributionQueue.add('distribute', { orderId: order.id, retryCount: 0 });

    res.status(201).json({ success: true, data: order, message: 'Orden creada y encolada para distribución.' });
  } catch (error) { next(error); }
};

exports.assignOrder = async (req, res, next) => {
  try {
    const { id } = req.params; // order id
    const { driver_id } = req.body;
    const order = await DeliveryOrder.findByPk(id);
    if (!order) return res.status(404).json({ success: false, message: 'Orden no encontrada' });
    
    order.driver_id = driver_id;
    order.status = 'assigned';
    await order.save();
    
    socket.getIO().to(`order_${id}`).emit('orderAssigned', { orderId: id, driverId: driver_id });
    
    res.json({ success: true, data: order });
  } catch (error) { next(error); }
};

exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const order = await DeliveryOrder.findByPk(id);
    if (!order) return res.status(404).json({ success: false, message: 'Orden no encontrada' });
    
    order.status = status;
    await order.save();
    
    socket.getIO().to(`order_${id}`).emit('orderStatusUpdated', { orderId: id, status });
    
    res.json({ success: true, data: order });
  } catch (error) { next(error); }
};

// ── LOCATIONS ───────────────────────────────────────────────────────────
exports.updateLocation = async (req, res, next) => {
  try {
    const { driver_id, latitude, longitude } = req.body;
    const location = await DriverLocation.create({ driver_id, latitude, longitude });
    
    socket.getIO().to(`driver_${driver_id}`).emit('driverLocationUpdated', { driverId: driver_id, latitude, longitude });
    
    res.status(201).json({ success: true, data: location });
  } catch (error) { next(error); }
};

exports.getDriverLocation = async (req, res, next) => {
  try {
    const { driver_id } = req.params;
    const locations = await DriverLocation.findAll({
      where: { driver_id },
      order: [['timestamp', 'DESC']],
      limit: 1
    });
    res.json({ success: true, data: locations[0] || null });
  } catch (error) { next(error); }
};

// ── RATINGS ─────────────────────────────────────────────────────────────
exports.rateDelivery = async (req, res, next) => {
  try {
    const { driver_id, order_id, rating, comment } = req.body;
    const rate = await DeliveryRating.create({ driver_id, order_id, rating, comment });
    res.status(201).json({ success: true, data: rate });
  } catch (error) { next(error); }
};
