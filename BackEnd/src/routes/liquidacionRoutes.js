const router = require('express').Router();
const ctrl = require('../controllers/liquidacionController');
const { authorizeRoles } = require('../middlewares/roleMiddleware');

// GET  /liquidaciones            → Resumen de productores con ganancias pendientes (Admin)
router.get('/', authorizeRoles('Administrador'), ctrl.getPendientes);

// POST /liquidaciones/:id        → Marcar un earning individual como liquidado (Admin)
router.post('/:id', authorizeRoles('Administrador'), ctrl.marcarLiquidado);

// POST /liquidaciones/batch/:productorId → Liquidar todos los pendientes de un productor (Admin)
router.post('/batch/:productorId', authorizeRoles('Administrador'), ctrl.liquidarBatch);

module.exports = router;
