const router = require('express').Router();
const ctrl = require('../Controllers/solicitudCambioRolController');
const { verifyToken } = require('../Middleware/authMiddleware');
const { authorizeRoles } = require('../Middleware/roleMiddleware');

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
router.get('/usuario/:usuarioId', verifyToken, ctrl.getByUsuario);
router.post('/', verifyToken, ctrl.create);

module.exports = router;
