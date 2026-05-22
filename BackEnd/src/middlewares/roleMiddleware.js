// ============================================================
// Middleware: roleMiddleware
// Descripción: Factory de middleware que verifica que el rol
//              del usuario autenticado esté en la lista de
//              roles permitidos
// ============================================================

/**
 * Middleware factory para autorización por roles.
 * Uso: authorizeRoles('Administrador', 'Productor')
 *
 * IMPORTANTE: Debe usarse DESPUÉS de verifyToken,
 * ya que depende de req.user.role
 *
 * @param  {...string} allowedRoles - Roles permitidos
 * @returns {Function} Middleware de Express
 */
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    // Verificar que req.user exista (verifyToken debe haberse ejecutado antes)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Acceso denegado: no se encontró información del usuario autenticado',
      });
    }

    // Verificar que el rol del usuario esté en los roles permitidos
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Acceso denegado: se requiere uno de los siguientes roles: ${allowedRoles.join(', ')}`,
      });
    }

    next();
  };
};

// Alias histórico: el código antiguo usaba `requireRole(...roles)`.
// Lo mantenemos exportado para no romper imports preexistentes.
const requireRole = authorizeRoles;

module.exports = { authorizeRoles, requireRole };
