const router = require('express').Router();
const ctrl = require('../controllers/distritoController');
const { verifyToken } = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/roleMiddleware');

// ── PÚBLICAS ────────────────────────────────────────────────
router.get('/', ctrl.getAll);
router.get('/canton/:cantonId', ctrl.getByCanton);
router.get('/:id', ctrl.getById);

// ── PROTEGIDAS (solo Administrador) ─────────────────────────
router.post('/',    verifyToken, authorizeRoles('Administrador'), ctrl.create);
router.put('/:id',  verifyToken, authorizeRoles('Administrador'), ctrl.update);
router.delete('/:id', verifyToken, authorizeRoles('Administrador'), ctrl.remove);

module.exports = router;
