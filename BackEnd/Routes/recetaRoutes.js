const router = require('express').Router();
const ctrl = require('../Controllers/recetaController');
const { verifyToken } = require('../Middleware/authMiddleware');
const { authorizeRoles } = require('../Middleware/roleMiddleware');

// ── PÚBLICAS ────────────────────────────────────────────────
// GET  /api/recetas       → Listar todas (con filtros via query)
// GET  /api/recetas/:id   → Obtener por ID
router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);

// ── PROTEGIDAS (solo Administrador) ─────────────────────────
// POST   /api/recetas       → Crear receta
// PUT    /api/recetas/:id   → Actualizar receta
// DELETE /api/recetas/:id   → Eliminar receta
router.post('/', verifyToken, authorizeRoles('Administrador'), ctrl.create);
router.put('/:id', verifyToken, authorizeRoles('Administrador'), ctrl.update);
router.delete('/:id', verifyToken, authorizeRoles('Administrador'), ctrl.remove);

module.exports = router;
