// ============================================================
// Middleware: authMiddleware
// Descripción: Verifica el token JWT del header Authorization
//              o de la cookie agromap_token, y adjunta el
//              usuario decodificado a req.user.
//
// Cualquier problema con el token (falta, formato inválido,
// expirado, firma inválida) devuelve 401. Esto es importante
// para que el cliente pueda distinguir "no autenticado" (401)
// de "autenticado pero sin permiso" (403, en roleMiddleware).
// ============================================================
const jwt = require('jsonwebtoken');

const respondUnauthorized = (res, message) =>
  res.status(401).json({ success: false, message, error: message });

const verifyToken = (req, res, next) => {
  try {
    let token = null;
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.agromap_token) {
      token = req.cookies.agromap_token;
    }

    if (!token) {
      return respondUnauthorized(
        res,
        'Acceso denegado: no se proporcionó un token de autenticación (Header o Cookie)'
      );
    }

    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (error) {
    console.error('[verifyToken] Verification failed:', error.message, error);
    if (error.name === 'TokenExpiredError') {
      return respondUnauthorized(res, 'Sesión expirada. El token ha expirado.');
    }
    // JsonWebTokenError u otro fallo de verificación → token inválido
    return respondUnauthorized(res, 'Token inválido o manipulado');
  }
};

module.exports = { verifyToken };
