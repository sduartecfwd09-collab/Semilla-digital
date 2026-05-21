const router = require('express').Router();
const ctrl = require('../controllers/provinciaController');

// GET  /api/provincias       → Listar todas
// GET  /api/provincias/:id   → Obtener por ID
// POST /api/provincias       → Crear
// PUT  /api/provincias/:id   → Actualizar
// DEL  /api/provincias/:id   → Eliminar

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
