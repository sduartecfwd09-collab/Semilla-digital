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

// Mock global de los middlewares de auth: stubs permisivos que asumen un admin
// autenticado. Los tests de controladores no se preocupan por la auth real.
// La integración real de verifyToken/requireRole se prueba en
// middleware.auth.test.js usando jest.requireActual para esquivar este mock.
jest.mock('../middlewares/authMiddleware', () => ({
  verifyToken: (req, _res, next) => {
    req.user = { id: 1, role: 'Administrador', email: 'test@admin.com' };
    next();
  },
}));

jest.mock('../middlewares/roleMiddleware', () => {
  const passthrough = (..._allowedRoles) => (_req, _res, next) => next();
  return { authorizeRoles: passthrough, requireRole: passthrough };
});
