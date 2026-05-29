const router = require('express').Router();
const ctrl = require('../controllers/proformaController');
const { verifyToken } = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/roleMiddleware');

// ── USUARIO AUTENTICADO ─────────────────────────────────────
// POST /api/proformas → Crear proforma (requiere login para registrar ganancia al productor)
router.post('/', verifyToken, ctrl.create);

// ── ADMIN ───────────────────────────────────────────────────
// GET    /api/proformas              → Listar todas (Admin)
// DELETE /api/proformas/:id          → Eliminar (Admin)
router.get('/', verifyToken, authorizeRoles('Administrador'), ctrl.getAll);
router.delete('/:id', verifyToken, authorizeRoles('Administrador'), ctrl.remove);

// ── USUARIO AUTENTICADO ─────────────────────────────────────
// GET  /api/proformas/usuario/:usuarioId → Mis proformas
// GET  /api/proformas/:id                → Por ID
router.get('/usuario/:usuarioId', verifyToken, ctrl.getByUsuario);
router.get('/:id', verifyToken, ctrl.getById);

module.exports = router;
