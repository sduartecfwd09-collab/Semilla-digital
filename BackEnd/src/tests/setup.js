'use strict';
// ── Setup global para todos los tests ────────────────────────────────────────
// Fija variables de entorno antes de que cualquier módulo las lea
process.env.NODE_ENV   = 'test';
process.env.JWT_SECRET = 'agromap_test_secret_key_12345';
process.env.JWT_EXPIRES_IN = '1h';
process.env.DB_NAME    = 'test_db';
process.env.DB_USER    = 'test';
process.env.DB_PASSWORD = 'test';
process.env.DB_HOST    = 'localhost';
process.env.DB_PORT    = '3306';
process.env.DB_DIALECT = 'mysql';

// Mock global de middlewares de autenticación para simplificar pruebas de controladores
jest.mock('../middlewares/authMiddleware', () => ({
  verifyToken: (req, res, next) => {
    req.user = { id: 1, role: 'Administrador', email: 'test@admin.com' };
    next();
  }
}));

jest.mock('../middlewares/roleMiddleware', () => ({
  authorizeRoles: (...allowedRoles) => (req, res, next) => {
    next();
  }
}));

