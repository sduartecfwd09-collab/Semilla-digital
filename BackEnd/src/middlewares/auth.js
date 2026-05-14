'use strict';
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

// ── verifyToken ───────────────────────────────────────────────────────────────
// Extrae y valida el token del header Authorization: Bearer <token>
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Acceso denegado. Token no proporcionado.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, email, role, iat, exp }
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Sesión expirada. Por favor inicia sesión nuevamente.' });
    }
    return res.status(401).json({ error: 'Token inválido.' });
  }
};

// ── requireRole ───────────────────────────────────────────────────────────────
// Uso: requireRole('Administrador') o requireRole('Administrador','Agricultor')
const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'No autenticado.' });
  }
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      error: `Acceso prohibido. Se requiere rol: ${roles.join(' o ')}.`,
    });
  }
  next();
};

module.exports = { verifyToken, requireRole };
