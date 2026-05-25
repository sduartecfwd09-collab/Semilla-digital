const router = require('express').Router();
const ctrl = require('../controllers/ofertaProductoController');
const { verifyToken } = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/roleMiddleware');

// ── PÚBLICAS ────────────────────────────────────────────────
// GET  /api/ofertas                       → Listar todas
// GET  /api/ofertas/feria/:feriaId        → Por feria
// GET  /api/ofertas/producto/:productoId  → Por producto
// GET  /api/ofertas/:id                   → Por ID
router.get('/', ctrl.getAll);
router.get('/feria/:feriaId', ctrl.getByFeria);
router.get('/producto/:productoId', ctrl.getByProducto);
router.get('/:id', ctrl.getById);

// ── PROTEGIDAS (Productor | Administrador) ──────────────────
// POST   /api/ofertas       → Crear oferta
// PUT    /api/ofertas/:id   → Actualizar oferta
// DELETE /api/ofertas/:id   → Eliminar oferta
router.post('/', verifyToken, authorizeRoles('Productor', 'Administrador'), ctrl.create);
router.put('/:id', verifyToken, authorizeRoles('Productor', 'Administrador'), ctrl.update);
router.delete('/:id', verifyToken, authorizeRoles('Productor', 'Administrador'), ctrl.remove);

module.exports = router;
