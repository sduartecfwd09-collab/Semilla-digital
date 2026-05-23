const router = require('express').Router();
const ctrl = require('../controllers/mensajeContactoController');
const { verifyToken } = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/roleMiddleware');

// GET   /api/mensajes        → Listar todos (solo Administrador) — para el panel admin
// GET   /api/mensajes/mios   → Solo los del usuario autenticado (buzón personal)
// POST  /api/mensajes        → Enviar mensaje de contacto (público)
// PATCH /api/mensajes/:id    → Editar mensaje (solo Admin)
// DEL   /api/mensajes/:id    → Eliminar mensaje (solo Admin)
router.get('/', verifyToken, authorizeRoles('Administrador'), ctrl.getAll);
router.get('/mios', verifyToken, ctrl.getMios);
router.post('/', ctrl.create);
// PATCH/DELETE: cualquier usuario autenticado puede editar/eliminar SUS
// propios mensajes; el controller valida ownership por correo del JWT.
router.patch('/:id', verifyToken, ctrl.update);
router.delete('/:id', verifyToken, ctrl.remove);

// ── ADMIN ───────────────────────────────────────────────────
// GET   /api/mensajes/pendientes        → Solo pendientes
// GET   /api/mensajes/:id               → Por ID
// PATCH /api/mensajes/:id/responder     → Responder mensaje
router.get('/pendientes', verifyToken, authorizeRoles('Administrador'), ctrl.getPendientes);
router.get('/:id', verifyToken, authorizeRoles('Administrador'), ctrl.getById);
router.patch('/:id/responder', verifyToken, authorizeRoles('Administrador'), ctrl.reply);

module.exports = router;
