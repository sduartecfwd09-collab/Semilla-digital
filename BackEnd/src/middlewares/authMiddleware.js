// ============================================================
// Middleware: authMiddleware
// Descripción: Verifica el token JWT del header Authorization
//              y adjunta el usuario decodificado a req.user
// ============================================================
const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  try {
    let token = null;
    const authHeader = req.headers.authorization;

    // 1. Intentar obtener token del header Authorization
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } 
    // 2. Intentar obtener token de la cookie si no está en el header
    else if (req.cookies && req.cookies.agromap_token) {
      token = req.cookies.agromap_token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Acceso denegado: no se proporcionó un token de autenticación (Header o Cookie)',
      });
    }

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
