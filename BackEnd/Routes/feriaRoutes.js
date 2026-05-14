const router = require('express').Router();
const ctrl = require('../Controllers/feriaController');
const { verifyToken } = require('../Middleware/authMiddleware');
const { authorizeRoles } = require('../Middleware/roleMiddleware');

// GET  /api/ferias       → Listar todas (público)
// GET  /api/ferias/:id   → Obtener por ID (público)
// POST /api/ferias       → Crear (solo Administrador)
// PUT  /api/ferias/:id   → Actualizar (solo Administrador)
// DEL  /api/ferias/:id   → Eliminar (solo Administrador)

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/', verifyToken, authorizeRoles('Administrador'), ctrl.create);
router.put('/:id', verifyToken, authorizeRoles('Administrador'), ctrl.update);
router.delete('/:id', verifyToken, authorizeRoles('Administrador'), ctrl.remove);

module.exports = router;
