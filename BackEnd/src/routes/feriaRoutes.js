const router = require('express').Router();
const ctrl = require('../controllers/feriaController');
const { verifyToken } = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/roleMiddleware');

// GET  /api/ferias       → Listar todas (público)
// GET  /api/ferias/:id   → Obtener por ID (público)
// POST /api/ferias       → Crear/sincronizar (público, idempotente por nombre)
// PUT  /api/ferias/:id   → Actualizar (solo Administrador)
// DEL  /api/ferias/:id   → Eliminar (solo Administrador)

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
// POST público: el service hace findOrCreate por `nombre`, así que llamadas
// repetidas no duplican. Esto permite la sincronización Google → BD desde
// cualquier visitante (que es lo que dispara `useFerias`).
router.post('/', ctrl.create);
router.put('/:id', verifyToken, authorizeRoles('Administrador'), ctrl.update);
router.delete('/:id', verifyToken, authorizeRoles('Administrador'), ctrl.remove);

module.exports = router;
