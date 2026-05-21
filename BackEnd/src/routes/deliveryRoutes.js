'use strict';
const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/deliveryController');
const { verifyToken, requireRole } = require('../middlewares/auth');

// ── DRIVERS
router.get('/drivers', verifyToken, requireRole('Administrador'), deliveryController.getDrivers);
router.post('/drivers', verifyToken, requireRole('Administrador'), deliveryController.registerDriver);
router.patch('/drivers/:id/status', verifyToken, requireRole('DRIVER'), deliveryController.updateDriverStatus);

// ── ORDERS
router.get('/orders', verifyToken, requireRole('Administrador', 'DRIVER'), deliveryController.getOrders);
router.post('/orders', verifyToken, requireRole('Usuario', 'Administrador'), deliveryController.createOrder);
router.patch('/orders/:id/assign', verifyToken, requireRole('Administrador', 'DRIVER'), deliveryController.assignOrder);
router.patch('/orders/:id/status', verifyToken, requireRole('DRIVER'), deliveryController.updateOrderStatus);

// ── LOCATIONS
router.post('/locations', verifyToken, requireRole('DRIVER'), deliveryController.updateLocation);
router.get('/locations/:driver_id', verifyToken, requireRole('Administrador', 'Usuario'), deliveryController.getDriverLocation);

// ── RATINGS
router.post('/ratings', verifyToken, requireRole('Usuario'), deliveryController.rateDelivery);

module.exports = router;
