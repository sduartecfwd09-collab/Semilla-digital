'use strict';
const router = require('express').Router();
const ctrl = require('../controllers/puestoAgricultorController');

router.get('/',       ctrl.getAll);    // soporta ?usuarioId=X
router.get('/:id',    ctrl.getById);
router.post('/',      ctrl.create);
router.put('/:id',    ctrl.update);
router.patch('/:id',  ctrl.patch);
router.delete('/:id', ctrl.remove);

module.exports = router;
