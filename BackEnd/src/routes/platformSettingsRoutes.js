const router = require('express').Router();
const ctrl = require('../controllers/platformSettingsController');
const { authorizeRoles } = require('../middlewares/roleMiddleware');

// GET  /platform-settings       → Ver configuración (Admin)
router.get('/', authorizeRoles('Administrador'), ctrl.getAll);

// PATCH /platform-settings/:clave → Actualizar valor (Admin)
router.patch('/:clave', authorizeRoles('Administrador'), ctrl.update);

module.exports = router;
