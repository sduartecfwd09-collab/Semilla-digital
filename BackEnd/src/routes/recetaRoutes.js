const router = require('express').Router();
const ctrl = require('../controllers/recetaController');
const { verifyToken } = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/roleMiddleware');
const { handleRecetaImageUpload } = require('../middlewares/uploadRecetaImage');

// ── PÚBLICAS ────────────────────────────────────────────────
router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);

// ── PROTEGIDAS (solo Administrador) ─────────────────────────
// El middleware handleRecetaImageUpload acepta multipart/form-data
// con campo `image`. Si llega JSON puro, el archivo simplemente no
// se procesa y el flujo continúa normalmente.
router.post('/', verifyToken, authorizeRoles('Administrador'), handleRecetaImageUpload, ctrl.create);
router.put('/:id', verifyToken, authorizeRoles('Administrador'), handleRecetaImageUpload, ctrl.update);
router.delete('/:id', verifyToken, authorizeRoles('Administrador'), ctrl.remove);

module.exports = router;
