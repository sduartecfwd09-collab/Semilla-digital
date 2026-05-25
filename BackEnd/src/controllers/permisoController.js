// ============================================================
// Controller: Permiso
// Descripción: Endpoints para gestión de permisos y roles RBAC
// ============================================================
'use strict';
const permisoService = require('../services/permisoService');
const auditService = require('../services/auditService');

/**
 * GET /permisos
 * Obtiene todos los permisos agrupados por módulo
 */
const getAllGrouped = async (req, res) => {
  try {
    const data = await permisoService.getAllPermisosGrouped();
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error al obtener permisos' });
  }
};

/**
 * GET /permisos/rol/:roleId
 * Obtiene los permisos asignados a un rol específico
 */
const getByRol = async (req, res) => {
  try {
    const data = await permisoService.getPermisosDeRol(req.params.roleId);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    if (error.message.includes('no encontrado')) {
      return res.status(404).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: 'Error al obtener permisos del rol' });
  }
};

/**
 * PUT /permisos/rol/:roleId
 * Asigna o revoca permisos a un rol
 * Body: { permisos: [{ permisoId: 1, otorgado: true }, ...] }
 */
const asignar = async (req, res) => {
  try {
    const { permisos } = req.body;
    if (!permisos || !Array.isArray(permisos)) {
      return res.status(400).json({ success: false, message: 'Se requiere un array de permisos' });
    }

    const data = await permisoService.asignarPermisos(req.params.roleId, permisos);

    // Registrar en auditoría
    await auditService.registrar({
      usuarioId: req.user?.id,
      accion: 'ASIGNAR_PERMISOS',
      recurso: 'roles',
      recursoId: parseInt(req.params.roleId),
      detalles: { permisos },
      req,
    });

    return res.status(200).json({ success: true, data });
  } catch (error) {
    if (error.message.includes('no encontrado')) {
      return res.status(404).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: 'Error al asignar permisos' });
  }
};

/**
 * GET /permisos/mis-permisos
 * Devuelve los permisos del usuario autenticado
 */
const misPermisos = async (req, res) => {
  try {
    let roleId = req.user.roleId;

    // Resolver roleId si solo tenemos el nombre
    if (!roleId && req.user.role) {
      const { Role } = require('../models');
      const role = await Role.findOne({ where: { nombre: req.user.role } });
      if (role) roleId = role.id;
    }

    if (!roleId) {
      return res.status(400).json({ success: false, message: 'No se encontró rol del usuario' });
    }

    const permisos = await permisoService.getPermisosByRoleId(roleId);
    return res.status(200).json({ success: true, data: { permisos } });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error al obtener permisos' });
  }
};

module.exports = {
  getAllGrouped,
  getByRol,
  asignar,
  misPermisos,
};
