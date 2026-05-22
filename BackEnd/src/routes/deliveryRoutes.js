'use strict';
const express = require('express');
const router = express.Router();
const dc = require('../controllers/deliveryController');
const { verifyToken, requireRole } = require('../middlewares/auth');

// ── SETTINGS (any authenticated user)
router.get('/settings', dc.getSettings);

// ── FEE CALCULATOR (any authenticated user)
router.get('/calculate-fee', dc.calculateFee);

// ── DRIVER SELF-SERVICE (role: DRIVER)
router.get('/drivers/me', requireRole('DRIVER', 'Repartidor'), dc.getMyDriverProfile);
router.get('/drivers/me/stats', requireRole('DRIVER', 'Repartidor'), dc.getMyStats);
router.get('/drivers/me/orders', requireRole('DRIVER', 'Repartidor'), dc.getMyOrders);
router.get('/drivers/me/earnings', requireRole('DRIVER', 'Repartidor'), dc.getMyEarnings);
router.patch('/drivers/me/status', requireRole('DRIVER', 'Repartidor'), dc.updateDriverStatus);

// ── DRIVERS (admin)
router.get('/drivers', requireRole('Administrador'), dc.getDrivers);
router.post('/drivers', requireRole('Administrador'), dc.registerDriver);

// ── ORDERS
router.get('/orders', requireRole('Administrador', 'DRIVER'), dc.getOrders);
router.get('/orders/:id', requireRole('Administrador', 'DRIVER', 'Usuario', 'Cliente'), dc.getOrderById);
router.post('/orders', requireRole('Usuario', 'Cliente', 'Administrador'), dc.createOrder);
router.patch('/orders/:id/assign', requireRole('Administrador'), dc.assignOrder);
router.post('/orders/:id/accept', requireRole('DRIVER', 'Repartidor'), dc.acceptOrderByDriver);
router.post('/orders/:id/reject', requireRole('DRIVER', 'Repartidor'), dc.rejectOrderByDriver);
router.patch('/orders/:id/status', requireRole('DRIVER', 'Administrador'), dc.updateOrderStatus);

// ── LOCATIONS
router.post('/locations', requireRole('DRIVER', 'Repartidor'), dc.updateLocation);
router.get('/locations/:driver_id', requireRole('Administrador', 'Usuario', 'Cliente'), dc.getDriverLocation);

// ── RATINGS
router.post('/ratings', requireRole('Usuario', 'Cliente'), dc.rateDelivery);

module.exports = router;
