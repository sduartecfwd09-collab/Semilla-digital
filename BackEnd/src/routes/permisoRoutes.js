'use strict';
const router = require('express').Router();
const ctrl = require('../controllers/permisoController');
const { verifyToken } = require('../middlewares/authMiddleware');
const { requirePermiso } = require('../middlewares/permisoMiddleware');

// ── MIS PERMISOS (cualquier usuario autenticado) ────────────
// GET /api/permisos/mis-permisos → Permisos del usuario actual
router.get('/mis-permisos', verifyToken, ctrl.misPermisos);

// ── ADMIN RBAC ──────────────────────────────────────────────
// GET  /api/permisos              → Todos los permisos agrupados por módulo
// GET  /api/permisos/rol/:roleId  → Permisos de un rol específico
// PUT  /api/permisos/rol/:roleId  → Asignar/revocar permisos a un rol
router.get('/', verifyToken, requirePermiso('roles.ver'), ctrl.getAllGrouped);
router.get('/rol/:roleId', verifyToken, requirePermiso('roles.ver'), ctrl.getByRol);
router.put('/rol/:roleId', verifyToken, requirePermiso('roles.asignar_permisos'), ctrl.asignar);

module.exports = router;
