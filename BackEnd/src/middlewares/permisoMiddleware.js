// ============================================================
// Middleware: permisoMiddleware
// Descripción: Middleware RBAC basado en permisos dinámicos
//              Funciona EN PARALELO con requireRole/authorizeRoles
//              (no los reemplaza, los complementa)
// ============================================================
'use strict';
const permisoService = require('../services/permisoService');

/**
 * Middleware factory que verifica si el usuario tiene un permiso específico.
 * 
 * Uso: requirePermiso('usuarios.crear')
 *      requirePermiso('productos.editar', 'productos.eliminar')  ← requiere AL MENOS uno
 *
 * IMPORTANTE: Debe usarse DESPUÉS de verifyToken, ya que depende de req.user
 *
 * @param {...string} permisosRequeridos - Claves de permisos requeridos
 * @returns {Function} Middleware de Express
 */
const requirePermiso = (...permisosRequeridos) => {
  return async (req, res, next) => {
    // Verificar que el usuario esté autenticado
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Acceso denegado: no autenticado.',
      });
    }

    try {
      // Si los permisos ya están cacheados en el JWT, usarlos
      if (req.user.permisos && Array.isArray(req.user.permisos)) {
        const tieneAlguno = permisosRequeridos.some((p) =>
          req.user.permisos.includes(p)
        );

        if (tieneAlguno) return next();

        return res.status(403).json({
          success: false,
          message: `Acceso denegado: se requiere permiso: ${permisosRequeridos.join(' o ')}`,
        });
      }

      // Fallback: consultar la BD si no hay permisos en el JWT
      // (backward compatibility con tokens generados antes del RBAC)
      if (!req.user.roleId && !req.user.role) {
        return res.status(403).json({
          success: false,
          message: 'Acceso denegado: no se encontró rol del usuario.',
        });
      }

      // Resolver roleId desde la BD si solo tenemos el nombre del rol
      let roleId = req.user.roleId;
      if (!roleId && req.user.role) {
        const { Role } = require('../models');
        const role = await Role.findOne({ where: { nombre: req.user.role } });
        if (role) roleId = role.id;
      }

      if (!roleId) {
        return res.status(403).json({
          success: false,
          message: 'Acceso denegado: rol no encontrado.',
        });
      }

      // Verificar permisos contra la BD
      for (const permiso of permisosRequeridos) {
        const tiene = await permisoService.tienePermiso(roleId, permiso);
        if (tiene) return next();
      }

      return res.status(403).json({
        success: false,
        message: `Acceso denegado: se requiere permiso: ${permisosRequeridos.join(' o ')}`,
      });
    } catch (error) {
      console.error('❌ Error en permisoMiddleware:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Error interno al verificar permisos.',
      });
    }
  };
};

module.exports = { requirePermiso };
