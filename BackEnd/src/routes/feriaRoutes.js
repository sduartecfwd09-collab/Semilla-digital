const router = require('express').Router();
const ctrl = require('../controllers/feriaController');
const { verifyToken } = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/roleMiddleware');

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
