const router = require('express').Router();
const ctrl = require('../Controllers/direccionController');

// GET  /api/direcciones       → Listar todas
// GET  /api/direcciones/:id   → Obtener por ID
// POST /api/direcciones       → Crear
// PUT  /api/direcciones/:id   → Actualizar
// DEL  /api/direcciones/:id   → Eliminar

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
