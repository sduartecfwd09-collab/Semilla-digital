const router = require('express').Router();
const ctrl = require('../controllers/mensajeContactoController');
const { verifyToken } = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/roleMiddleware');

// ── PÚBLICA ─────────────────────────────────────────────────
// GET   /api/mensajes                   → Listar todos (se filtra en frontend)
// POST  /api/mensajes                   → Enviar mensaje de contacto
// PATCH /api/mensajes/:id               → Editar mensaje (por el usuario si está pendiente)
// DEL   /api/mensajes/:id               → Eliminar mensaje (por el usuario)
router.get('/', ctrl.getAll);
router.post('/', ctrl.create);
router.patch('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

// ── ADMIN ───────────────────────────────────────────────────
// GET   /api/mensajes/pendientes        → Solo pendientes
// GET   /api/mensajes/:id               → Por ID
// PATCH /api/mensajes/:id/responder     → Responder mensaje
router.get('/pendientes', verifyToken, authorizeRoles('Administrador'), ctrl.getPendientes);
router.get('/:id', verifyToken, authorizeRoles('Administrador'), ctrl.getById);
router.patch('/:id/responder', verifyToken, authorizeRoles('Administrador'), ctrl.reply);

module.exports = router;
