'use strict';
const router = require('express').Router();
const ctrl = require('../controllers/solicitudCambioRolController');

router.get('/',       ctrl.getAll);
router.get('/:id',    ctrl.getById);
router.post('/',      ctrl.create);
router.patch('/:id',  ctrl.patch);
router.delete('/:id', ctrl.remove);

module.exports = router;
