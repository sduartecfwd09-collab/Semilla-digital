'use strict';
require('./setup');

// No necesita mock de modelos - es un test unitario puro del middleware
jest.mock('../models', () => ({
  sequelize: { authenticate: jest.fn().mockResolvedValue(), sync: jest.fn().mockResolvedValue() },
}));

// Setup.js mockea estos middlewares globalmente (stubs para tests de controladores).
// Acá queremos probar el comportamiento REAL, así que usamos `requireActual`
// para esquivar los mocks globales.
const jwt = require('jsonwebtoken');
const { verifyToken } = jest.requireActual('../middlewares/authMiddleware');
const { requireRole } = jest.requireActual('../middlewares/roleMiddleware');

// ── Helpers para simular req/res/next de Express ──────────────────────────────
const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json   = jest.fn().mockReturnValue(res);
  return res;
};
const mockNext = jest.fn();

// ─────────────────────────────────────────────────────────────────────────────
describe('verifyToken middleware', () => {
  beforeEach(() => mockNext.mockClear());

  test('llama next() con token válido y adjunta req.user', () => {
    const token = jwt.sign({ id: 1, role: 'Productor' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = mockRes();

    verifyToken(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledTimes(1);
    expect(req.user).toBeDefined();
    expect(req.user.id).toBe(1);
    expect(req.user.role).toBe('Productor');
  });

  test('401 - sin header Authorization', () => {
    const req = { headers: {} };
    const res = mockRes();

    verifyToken(req, res, mockNext);

    expect(mockNext).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.stringMatching(/token/i) }));
  });

  test('401 - token con firma inválida', () => {
    const req = { headers: { authorization: 'Bearer token.falso.invalido' } };
    const res = mockRes();

    verifyToken(req, res, mockNext);

    expect(mockNext).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
  });

  test('401 - token expirado devuelve mensaje de sesión expirada', () => {
    const expired = jwt.sign({ id: 1 }, process.env.JWT_SECRET, { expiresIn: '-1s' });
    const req = { headers: { authorization: `Bearer ${expired}` } };
    const res = mockRes();

    verifyToken(req, res, mockNext);

    expect(mockNext).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.stringMatching(/expirada/i) }));
  });

  test('401 - header sin prefijo Bearer', () => {
    const token = jwt.sign({ id: 1 }, process.env.JWT_SECRET);
    const req = { headers: { authorization: token } }; // sin "Bearer "
    const res = mockRes();

    verifyToken(req, res, mockNext);

    expect(mockNext).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('requireRole middleware', () => {
  beforeEach(() => mockNext.mockClear());

  test('llama next() si el rol está permitido', () => {
    const req = { user: { id: 1, role: 'Administrador' } };
    const res = mockRes();

    requireRole('Administrador')(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledTimes(1);
  });

  test('llama next() si el rol está entre múltiples permitidos', () => {
    const req = { user: { id: 2, role: 'Productor' } };
    const res = mockRes();

    requireRole('Administrador', 'Productor')(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledTimes(1);
  });

  test('403 - rol no permitido', () => {
    const req = { user: { id: 3, role: 'Usuario' } };
    const res = mockRes();

    requireRole('Administrador')(req, res, mockNext);

    expect(mockNext).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringMatching(/Acceso denegado/i) }));
  });

  test('401 - req.user no existe (token no verificado antes)', () => {
    const req = {}; // sin user
    const res = mockRes();

    requireRole('Administrador')(req, res, mockNext);

    expect(mockNext).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
  });
});
