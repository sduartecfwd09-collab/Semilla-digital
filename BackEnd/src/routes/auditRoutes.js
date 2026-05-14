'use strict';
const router = require('express').Router();
const ctrl = require('../controllers/auditController');
const { verifyToken } = require('../middlewares/authMiddleware');
const { requirePermiso } = require('../middlewares/permisoMiddleware');

// ── AUDITORÍA (solo usuarios con permiso auditoria.ver) ─────
// GET /api/auditoria?usuarioId=1&accion=LOGIN&desde=2026-01-01&page=1
router.get('/', verifyToken, requirePermiso('auditoria.ver'), ctrl.getLogs);

module.exports = router;
