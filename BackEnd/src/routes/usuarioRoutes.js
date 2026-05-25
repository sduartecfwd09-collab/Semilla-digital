const router = require('express').Router();
const ctrl = require('../controllers/usuarioController');
const { verifyToken } = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/roleMiddleware');

// Solo permite continuar si el usuario autenticado es el dueño del recurso
// (`req.params.id === req.user.id`) o si es Administrador.
const ownerOrAdmin = (req, res, next) => {
  const targetId = String(req.params.id);
  const requesterId = String(req.user?.id);
  if (targetId === requesterId || req.user?.role === 'Administrador') {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: 'No tenés permiso para acceder a este recurso',
  });
};

// ── AUTH (público) ──────────────────────────────────────────
// POST /api/usuarios/register → Registrarse
router.post('/register', ctrl.register);

// ── PERFIL (autenticado) ────────────────────────────────────
// GET  /api/usuarios/profile  → Obtener perfil propio
router.get('/profile', verifyToken, ctrl.getProfile);

// ── ADMIN ───────────────────────────────────────────────────
// GET    /api/usuarios               → Listar todos (solo Admin)
// POST   /api/usuarios               → Crear usuario (solo Admin)
// PATCH  /api/usuarios/:id/status    → Cambiar status (solo Admin)
// DELETE /api/usuarios/:id           → Eliminar (solo Admin)
router.get('/', verifyToken, authorizeRoles('Administrador'), ctrl.getAll);
router.post('/', verifyToken, authorizeRoles('Administrador'), ctrl.create);
router.patch('/:id/status', verifyToken, authorizeRoles('Administrador'), ctrl.changeStatus);
router.delete('/:id', verifyToken, authorizeRoles('Administrador'), ctrl.remove);

// ── USUARIO AUTENTICADO ─────────────────────────────────────
// GET  /api/usuarios/:id            → Obtener por ID (autenticado)
// PUT  /api/usuarios/:id            → Actualizar (autenticado)
// PATCH /api/usuarios/:id           → Actualizar parcial (autenticado)
// PATCH /api/usuarios/:id/password  → Cambiar contraseña validando la actual
router.get('/:id', verifyToken, ownerOrAdmin, ctrl.getById);
router.put('/:id', verifyToken, ownerOrAdmin, ctrl.update);
router.patch('/:id/password', verifyToken, ctrl.changePassword); // ya valida ownership internamente
router.patch('/:id', verifyToken, ownerOrAdmin, ctrl.update);

module.exports = router;
