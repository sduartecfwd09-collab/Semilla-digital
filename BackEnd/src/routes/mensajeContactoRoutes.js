const router = require('express').Router();
const ctrl = require('../controllers/mensajeContactoController');
const { verifyToken } = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/roleMiddleware');

// ── PÚBLICA ─────────────────────────────────────────────────
// POST /api/mensajes → Enviar mensaje de contacto (público)
router.post('/', ctrl.create);

// ── ADMIN ───────────────────────────────────────────────────
// GET   /api/mensajes                   → Listar todos
// GET   /api/mensajes/pendientes        → Solo pendientes
// GET   /api/mensajes/:id               → Por ID
// PATCH /api/mensajes/:id/responder     → Responder mensaje
// DEL   /api/mensajes/:id               → Eliminar mensaje
router.get('/', verifyToken, authorizeRoles('Administrador'), ctrl.getAll);
router.get('/pendientes', verifyToken, authorizeRoles('Administrador'), ctrl.getPendientes);
router.get('/:id', verifyToken, authorizeRoles('Administrador'), ctrl.getById);
router.patch('/:id/responder', verifyToken, authorizeRoles('Administrador'), ctrl.reply);
router.delete('/:id', verifyToken, authorizeRoles('Administrador'), ctrl.remove);

module.exports = router;
