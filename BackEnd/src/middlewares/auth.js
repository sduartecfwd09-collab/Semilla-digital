'use strict';
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

// ── verifyToken ───────────────────────────────────────────────────────────────
// Extrae y valida el token del header Authorization: Bearer <token>
const verifyToken = (req, res, next) => {
  try {
    let token = null;
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];

    // 1. Intentar header
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } 
    // 2. Intentar cookie
    else if (req.cookies && req.cookies.agromap_token) {
      token = req.cookies.agromap_token;
    }

    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'Acceso denegado: no se proporcionó un token de autenticación (Header o Cookie)' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        message: 'El token ha expirado. Inicie sesión nuevamente' 
      });
    }
    return res.status(403).json({ 
      success: false,
      message: 'Token inválido o manipulado' 
    });
  }
};


// ── requireRole ───────────────────────────────────────────────────────────────
// Uso: requireRole('Administrador') o requireRole('Administrador','Agricultor')
const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false,
      message: 'No autenticado.' 
    });
  }
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: `Acceso prohibido. Se requiere rol: ${roles.join(' o ')}.`,
    });
  }
  next();
};


module.exports = { verifyToken, requireRole };
