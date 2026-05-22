const router = require('express').Router();
const ctrl = require('../controllers/solicitudCambioRolController');
const { verifyToken } = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/roleMiddleware');
const { handleSelfieUpload } = require('../middlewares/uploadSelfie');

// ── ADMIN ───────────────────────────────────────────────────
// GET   /api/solicitudes                  → Listar todas (Admin)
// GET   /api/solicitudes/pendientes       → Solo pendientes (Admin)
// PATCH /api/solicitudes/:id/aprobar      → Aprobar solicitud (Admin)
// PATCH /api/solicitudes/:id/rechazar     → Rechazar solicitud (Admin)
router.get('/', verifyToken, authorizeRoles('Administrador'), ctrl.getAll);
router.get('/pendientes', verifyToken, authorizeRoles('Administrador'), ctrl.getPendientes);
router.patch('/:id/aprobar', verifyToken, authorizeRoles('Administrador'), ctrl.approve);
router.patch('/:id/rechazar', verifyToken, authorizeRoles('Administrador'), ctrl.reject);

// ── USUARIO AUTENTICADO ─────────────────────────────────────
<<<<<<< HEAD
// GET  /api/solicitudes/usuario/:usuarioId → Mis solicitudes
// POST /api/solicitudes                    → Crear solicitud
// PATCH /api/solicitudes/:id               → Actualizar solicitud
router.get('/usuario/:usuarioId', verifyToken, ctrl.getByUsuario);
router.post('/', verifyToken, handleSelfieUpload, ctrl.create);
router.patch('/:id', verifyToken, handleSelfieUpload, ctrl.update);
=======
// GET   /api/solicitudes/usuario/:usuarioId → Mis solicitudes
// POST  /api/solicitudes                    → Crear solicitud
// PATCH /api/solicitudes/:id                → Actualizar solicitud (modo edición)
router.get('/usuario/:usuarioId', verifyToken, ctrl.getByUsuario);
router.post('/', verifyToken, ctrl.create);
router.patch('/:id', verifyToken, ctrl.update);
>>>>>>> 23cae5ce1cac93a309b789a8f54cd0593a6c25f6

module.exports = router;
