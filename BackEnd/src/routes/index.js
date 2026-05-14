'use strict';
const express = require('express');
const router  = express.Router();
const { verifyToken, requireRole } = require('../middlewares/auth');

// ── Rutas públicas ────────────────────────────────────────────────────────────
router.use('/auth',      require('./authRoutes'));

// El frontend muestra ferias, productos y recetas sin login
router.use('/ferias',    require('./feriaRoutes'));
router.use('/productos', require('./productoRoutes'));
router.use('/recetas',   require('./recetaRoutes'));
router.use('/precios',   require('./precioRoutes'));

// POST /contactMessages es público (formulario de contacto sin login)
router.post('/contactMessages', require('../controllers/contactMessageController').create);

// ── Rutas que requieren token válido ──────────────────────────────────────────
router.use('/usuarios',
  verifyToken,
  require('./usuarioRoutes')
);

router.use('/puestosAgricultor',
  verifyToken,
  require('./puestoAgricultorRoutes')
);

router.use('/solicitudesCambioRol',
  verifyToken,
  require('./solicitudCambioRolRoutes')
);

// GET/PATCH/DELETE de mensajes: solo Admin o Agricultor autenticados
router.use('/contactMessages',
  verifyToken,
  requireRole('Administrador', 'Agricultor'),
  require('./contactMessageRoutes')
);

module.exports = router;
