'use strict';
const express = require('express');
const router = express.Router();
const dc = require('../controllers/deliveryController');
const { verifyToken } = require('../middlewares/authMiddleware');
const { requireRole } = require('../middlewares/roleMiddleware');

// ── SETTINGS (any authenticated user)
router.get('/settings', dc.getSettings);

// ── FEE CALCULATOR (any authenticated user)
router.get('/calculate-fee', dc.calculateFee);

// ── REPARTIDOR SELF-SERVICE
router.get('/drivers/me', requireRole('Repartidor'), dc.getMyDriverProfile);
router.get('/drivers/me/stats', requireRole('Repartidor'), dc.getMyStats);
router.get('/drivers/me/orders', requireRole('Repartidor'), dc.getMyOrders);
router.get('/drivers/me/earnings', requireRole('Repartidor'), dc.getMyEarnings);
router.patch('/drivers/me/status', requireRole('Repartidor'), dc.updateDriverStatus);

// ── REPARTIDORES (admin)
router.get('/drivers', requireRole('Administrador'), dc.getDrivers);
router.post('/drivers', requireRole('Administrador'), dc.registerDriver);

// ── ORDERS
router.get('/orders', requireRole('Administrador', 'Repartidor'), dc.getOrders);
router.get('/orders/:id', requireRole('Administrador', 'Repartidor', 'Usuario'), dc.getOrderById);
router.post('/orders', requireRole('Usuario', 'Administrador'), dc.createOrder);
router.patch('/orders/:id/assign', requireRole('Administrador'), dc.assignOrder);
router.post('/orders/:id/accept', requireRole('Repartidor'), dc.acceptOrderByDriver);
router.post('/orders/:id/reject', requireRole('Repartidor'), dc.rejectOrderByDriver);
router.patch('/orders/:id/status', requireRole('Repartidor', 'Administrador'), dc.updateOrderStatus);

// ── LOCATIONS
router.post('/locations', requireRole('Repartidor'), dc.updateLocation);
router.get('/locations/:driver_id', requireRole('Administrador', 'Usuario'), dc.getDriverLocation);

// ── RATINGS
router.post('/ratings', requireRole('Usuario'), dc.rateDelivery);

module.exports = router;
