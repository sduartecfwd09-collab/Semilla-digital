'use strict';
const router = require('express').Router();
const ctrl = require('../controllers/precioController');

router.get('/',       ctrl.getAll);
router.get('/:id',    ctrl.getById);
router.patch('/:id',  ctrl.patch);
router.delete('/:id', ctrl.remove);

module.exports = router;
