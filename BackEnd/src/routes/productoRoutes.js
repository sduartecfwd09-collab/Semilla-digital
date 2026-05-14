const router = require('express').Router();
const ctrl = require('../controllers/productoController');
const { verifyToken } = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/roleMiddleware');

// ── PÚBLICAS ────────────────────────────────────────────────
// GET  /api/productos                       → Listar todos (con filtros via query)
// GET  /api/productos/usuario/:userId       → Por agricultor
// GET  /api/productos/categoria/:categoria  → Por categoría
// GET  /api/productos/:id                   → Por ID
router.get('/', ctrl.getAll);
router.get('/usuario/:userId', ctrl.getByUser);
router.get('/categoria/:categoria', ctrl.getByCategoria);
router.get('/:id', ctrl.getById);

// ── PROTEGIDAS (Agricultor | Administrador) ─────────────────
// POST   /api/productos                → Crear producto
// PUT    /api/productos/:id            → Actualizar producto
// PATCH  /api/productos/:id/disponible → Toggle disponibilidad
// DELETE /api/productos/:id            → Eliminar producto
router.post('/', verifyToken, authorizeRoles('Agricultor', 'Administrador'), ctrl.create);
router.put('/:id', verifyToken, authorizeRoles('Agricultor', 'Administrador'), ctrl.update);
router.patch('/:id/disponible', verifyToken, authorizeRoles('Agricultor', 'Administrador'), ctrl.toggleDisponible);
router.delete('/:id', verifyToken, authorizeRoles('Agricultor', 'Administrador'), ctrl.remove);

module.exports = router;
