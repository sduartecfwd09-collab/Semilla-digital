const router = require('express').Router();
const ctrl = require('../controllers/puestoProductorController');
const { verifyToken } = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/roleMiddleware');

// ── PÚBLICAS ────────────────────────────────────────────────
// GET  /api/puestos                       → Listar todos
// GET  /api/puestos/usuario/:usuarioId    → Por usuario (1:1)
// GET  /api/puestos/feria/:feriaId        → Por feria
// GET  /api/puestos/:id                   → Por ID
router.get('/', ctrl.getAll);
router.get('/usuario/:usuarioId', ctrl.getByUsuario);
router.get('/feria/:feriaId', ctrl.getByFeria);
router.get('/:id', ctrl.getById);

// ── PROTEGIDAS ──────────────────────────────────────────────
// POST   /api/puestos       → Crear puesto (aplica también a Usuario en proceso de solicitud Productor)
// PUT    /api/puestos/:id   → Actualizar puesto (idem)
// DELETE /api/puestos/:id   → Eliminar puesto (solo Admin)
router.post('/', verifyToken, authorizeRoles('Usuario', 'Productor', 'Administrador'), ctrl.create);
router.put('/:id', verifyToken, authorizeRoles('Usuario', 'Productor', 'Administrador'), ctrl.update);
router.delete('/:id', verifyToken, authorizeRoles('Administrador'), ctrl.remove);

module.exports = router;
