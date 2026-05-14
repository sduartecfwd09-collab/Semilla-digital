const router = require('express').Router();
const ctrl = require('../controllers/distritoController');

// GET  /api/distritos                  → Listar todos
// GET  /api/distritos/:id              → Obtener por ID
// GET  /api/distritos/canton/:cantonId → Filtrar por cantón
// POST /api/distritos                  → Crear
// PUT  /api/distritos/:id              → Actualizar
// DEL  /api/distritos/:id              → Eliminar

router.get('/', ctrl.getAll);
router.get('/canton/:cantonId', ctrl.getByCanton);
router.get('/:id', ctrl.getById);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
