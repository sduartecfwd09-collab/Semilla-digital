'use strict';
const express = require('express');
const router  = express.Router();
const { verifyToken } = require('../middlewares/authMiddleware');

// ── Rutas públicas ──────────────────────────────────────────────
router.use('/auth',       require('./authRoutes'));
router.use('/ferias',     require('./feriaRoutes'));
router.use('/productos',  require('./productoRoutes'));
router.use('/recetas',    require('./recetaRoutes'));
router.use('/provincias', require('./provinciaRoutes'));
router.use('/cantones',   require('./cantonRoutes'));
router.use('/distritos',  require('./distritoRoutes'));
router.use('/mensajes',   require('./mensajeContactoRoutes'));

// ── Rutas protegidas ────────────────────────────────────────────
router.use('/usuarios',
  verifyToken,
  require('./usuarioRoutes')
);

router.use('/puestos',
  verifyToken,
  require('./puestoProductorRoutes')
);

router.use('/solicitudes',
  verifyToken,
  require('./solicitudCambioRolRoutes')
);

router.use('/direcciones',
  verifyToken,
  require('./direccionRoutes')
);

router.use('/ofertas',
  verifyToken,
  require('./ofertaProductoRoutes')
);



router.use('/proformas',
  verifyToken,
  require('./proformaRoutes')
);

// ── RBAC & Auditoría (nuevas rutas) ─────────────────────────────
router.use('/permisos',
  verifyToken,
  require('./permisoRoutes')
);

router.use('/auditoria',
  verifyToken,
  require('./auditRoutes')
);

// ── Delivery ────────────────────────────────────────────────────────────
router.use('/delivery',
  verifyToken,
  require('./deliveryRoutes')
);

// ── Ganancias productores ────────────────────────────────────────────────
router.use('/ventas',
  verifyToken,
  require('./ventaProductorRoutes')
);

router.use('/platform-settings',
  verifyToken,
  require('./platformSettingsRoutes')
);

router.use('/liquidaciones',
  verifyToken,
  require('./liquidacionRoutes')
);

module.exports = router;
