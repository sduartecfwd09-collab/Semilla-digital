const router = require('express').Router();
const ctrl = require('../controllers/productoController');
const { verifyToken } = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/roleMiddleware');

// ── PÚBLICAS ────────────────────────────────────────────────
// GET  /api/productos                       → Listar todos (con filtros via query)
// GET  /api/productos/usuario/:userId       → Por productor
// GET  /api/productos/categoria/:categoria  → Por categoría
// GET  /api/productos/:id                   → Por ID
router.get('/', ctrl.getAll);
router.get('/usuario/:userId', ctrl.getByUser);
router.get('/categoria/:categoria', ctrl.getByCategoria);
router.get('/:id', ctrl.getById);

// ── PROTEGIDAS (Productor | Administrador) ──────────────────
// POST   /api/productos                → Crear producto
// PUT    /api/productos/:id            → Actualizar producto
// PATCH  /api/productos/:id/disponible → Toggle disponibilidad
// DELETE /api/productos/:id            → Eliminar producto
router.post('/', verifyToken, authorizeRoles('Productor', 'Administrador'), ctrl.create);
router.put('/:id', verifyToken, authorizeRoles('Productor', 'Administrador'), ctrl.update);
router.patch('/:id/disponible', verifyToken, authorizeRoles('Productor', 'Administrador'), ctrl.toggleDisponible);
router.patch('/:id', verifyToken, authorizeRoles('Productor', 'Administrador'), ctrl.update);
router.delete('/:id', verifyToken, authorizeRoles('Productor', 'Administrador'), ctrl.remove);

module.exports = router;
