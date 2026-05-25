// ============================================================
// Service: Permiso
// Descripción: Lógica de negocio para el sistema RBAC
//              Consulta permisos por rol, verifica acceso
// ============================================================
'use strict';
const { Role, Permiso, RolePermiso, Modulo } = require('../models');

/**
 * Obtiene todas las claves de permisos otorgados para un role_id
 * @param {number} roleId
 * @returns {Promise<string[]>} Array de claves: ['usuarios.ver', 'productos.crear', ...]
 */
const getPermisosByRoleId = async (roleId) => {
  const asignaciones = await RolePermiso.findAll({
    where: { role_id: roleId, otorgado: true },
    include: [{ model: Permiso, as: 'permiso', attributes: ['clave'] }],
  });

  return asignaciones.map((a) => a.permiso.clave);
};

/**
 * Verifica si un rol tiene un permiso específico
 * @param {number} roleId
 * @param {string} clave - Ej: 'usuarios.crear'
 * @returns {Promise<boolean>}
 */
const tienePermiso = async (roleId, clave) => {
  const count = await RolePermiso.count({
    where: { role_id: roleId, otorgado: true },
    include: [{
      model: Permiso,
      as: 'permiso',
      where: { clave },
    }],
  });
  return count > 0;
};

/**
 * Obtiene todos los permisos agrupados por módulo (para panel admin)
 */
const getAllPermisosGrouped = async () => {
  return await Modulo.findAll({
    order: [['orden', 'ASC']],
    include: [{
      model: Permiso,
      as: 'permisos',
      attributes: ['id', 'clave', 'nombre', 'descripcion'],
    }],
  });
};

/**
 * Obtiene los permisos asignados a un rol específico (para panel admin)
 */
const getPermisosDeRol = async (roleId) => {
  const role = await Role.findByPk(roleId, {
    include: [{
      model: Permiso,
      as: 'permisos',
      attributes: ['id', 'clave', 'nombre', 'descripcion'],
      through: { attributes: ['otorgado'] },
    }],
  });

  if (!role) throw new Error('Rol no encontrado');
  return role;
};

/**
 * Asigna o revoca permisos a un rol
 * @param {number} roleId
 * @param {Array<{permisoId: number, otorgado: boolean}>} permisos
 */
const asignarPermisos = async (roleId, permisos) => {
  const role = await Role.findByPk(roleId);
  if (!role) throw new Error('Rol no encontrado');

  for (const { permisoId, otorgado } of permisos) {
    const [record] = await RolePermiso.findOrCreate({
      where: { role_id: roleId, permiso_id: permisoId },
      defaults: { otorgado },
    });

    if (record.otorgado !== otorgado) {
      await record.update({ otorgado });
    }
  }

  return await getPermisosDeRol(roleId);
};

module.exports = {
  getPermisosByRoleId,
  tienePermiso,
  getAllPermisosGrouped,
  getPermisosDeRol,
  asignarPermisos,
};
