const router = require('express').Router();
const ctrl = require('../controllers/cantonController');

// GET  /api/cantones                        → Listar todos
// GET  /api/cantones/:id                    → Obtener por ID
// GET  /api/cantones/provincia/:provinciaId → Filtrar por provincia
// POST /api/cantones                        → Crear
// PUT  /api/cantones/:id                    → Actualizar
// DEL  /api/cantones/:id                    → Eliminar

router.get('/', ctrl.getAll);
router.get('/provincia/:provinciaId', ctrl.getByProvincia);
router.get('/:id', ctrl.getById);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
