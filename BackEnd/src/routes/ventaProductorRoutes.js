const router = require('express').Router();
const ctrl = require('../controllers/ventaProductorController');
const { authorizeRoles } = require('../middlewares/roleMiddleware');

// GET /ventas/me → Mis ventas (Productor)
router.get('/me', authorizeRoles('Productor', 'Administrador'), ctrl.getMisVentas);

// GET /ventas/:productorId → Ventas de un productor (Admin)
router.get('/:productorId', authorizeRoles('Administrador'), ctrl.getVentasByProductor);

module.exports = router;
