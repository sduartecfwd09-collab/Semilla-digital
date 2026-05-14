// ============================================================
// Middleware: authMiddleware
// Descripción: Verifica el token JWT del header Authorization
//              y adjunta el usuario decodificado a req.user
// ============================================================
const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Acceso denegado: no se proporcionó un token de autenticación',
      });
    }

    // Formato esperado: "Bearer <token>"
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({
        success: false,
        message: 'Formato de token inválido. Use: Bearer <token>',
      });
    }

    const token = parts[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Adjuntar el payload decodificado a req.user
    req.user = decoded;

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'El token ha expirado. Inicie sesión nuevamente',
      });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({
        success: false,
        message: 'Token inválido o manipulado',
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Error al verificar el token',
    });
  }
};

module.exports = { verifyToken };
