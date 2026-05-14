const router = require('express').Router();
const ctrl = require('../Controllers/usuarioController');
const { verifyToken } = require('../Middleware/authMiddleware');
const { authorizeRoles } = require('../Middleware/roleMiddleware');

// ── AUTH (público) ──────────────────────────────────────────
// POST /api/usuarios/login    → Iniciar sesión
// POST /api/usuarios/register → Registrarse
router.post('/login', ctrl.login);
router.post('/register', ctrl.register);

// ── PERFIL (autenticado) ────────────────────────────────────
// GET  /api/usuarios/profile  → Obtener perfil propio
router.get('/profile', verifyToken, ctrl.getProfile);

// ── ADMIN ───────────────────────────────────────────────────
// GET    /api/usuarios               → Listar todos (solo Admin)
// PATCH  /api/usuarios/:id/status    → Cambiar status (solo Admin)
// DELETE /api/usuarios/:id           → Eliminar (solo Admin)
router.get('/', verifyToken, authorizeRoles('Administrador'), ctrl.getAll);
router.patch('/:id/status', verifyToken, authorizeRoles('Administrador'), ctrl.changeStatus);
router.delete('/:id', verifyToken, authorizeRoles('Administrador'), ctrl.remove);

// ── USUARIO AUTENTICADO ─────────────────────────────────────
// GET  /api/usuarios/:id    → Obtener por ID (autenticado)
// PUT  /api/usuarios/:id    → Actualizar (autenticado)
router.get('/:id', verifyToken, ctrl.getById);
router.put('/:id', verifyToken, ctrl.update);

module.exports = router;
