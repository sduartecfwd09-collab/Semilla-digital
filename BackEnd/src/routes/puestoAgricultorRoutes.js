const router = require('express').Router();
const ctrl = require('../controllers/puestoAgricultorController');
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

// ── PROTEGIDAS (Agricultor | Administrador) ─────────────────
// POST   /api/puestos       → Crear puesto
// PUT    /api/puestos/:id   → Actualizar puesto
// DELETE /api/puestos/:id   → Eliminar puesto
router.post('/', verifyToken, authorizeRoles('Agricultor', 'Administrador'), ctrl.create);
router.put('/:id', verifyToken, authorizeRoles('Agricultor', 'Administrador'), ctrl.update);
router.delete('/:id', verifyToken, authorizeRoles('Agricultor', 'Administrador'), ctrl.remove);

module.exports = router;
