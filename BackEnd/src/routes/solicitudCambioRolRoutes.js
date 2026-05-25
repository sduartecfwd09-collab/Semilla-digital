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
// GET  /api/solicitudes/usuario/:usuarioId → Mis solicitudes
// POST /api/solicitudes                    → Crear solicitud
// PATCH /api/solicitudes/:id               → Actualizar solicitud
router.get('/usuario/:usuarioId', verifyToken, ctrl.getByUsuario);
router.post('/', verifyToken, handleSelfieUpload, ctrl.create);
router.patch('/:id', verifyToken, handleSelfieUpload, ctrl.update);

module.exports = router;
