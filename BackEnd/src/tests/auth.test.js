'use strict';
require('./setup');

const jwt = require('jsonwebtoken');

jest.mock('bcrypt', () => ({
  compare: jest.fn().mockImplementation((plain, hashed) => Promise.resolve(plain === hashed)),
  hash: jest.fn().mockResolvedValue('hashed_pass'),
}));

// ── Mock del modelo Usuario ───────────────────────────────────────────────────
jest.mock('../models', () => {
  const mockUsuario = {
    id: 1,
    name: 'Admin Test',
    email: 'admin@test.cr',
    password: 'admin123',
    role: 'Administrador',
    status: 'Activo',
    toJSON() {
      return {
        id: this.id, name: this.name, email: this.email,
        password: this.password, role: this.role, status: this.status,
      };
    },
  };

  return {
    sequelize: {
      authenticate: jest.fn().mockResolvedValue(),
      sync: jest.fn().mockResolvedValue(),
    },
    Usuario: {
      findOne: jest.fn(),
      findByPk: jest.fn(),
      create: jest.fn(),
    },
    Role: {
      findOne: jest.fn().mockResolvedValue({ id: 1, nombre: 'Usuario' }),
    },
    Permiso: {
      findAll: jest.fn().mockResolvedValue([]),
    },
    RolePermiso: {
      findAll: jest.fn().mockResolvedValue([]),
    },
  };
});

const request  = require('supertest');
const app      = require('../app');
const { Usuario } = require('../models');

// ─────────────────────────────────────────────────────────────────────────────
describe('POST /auth/register', () => {
  beforeEach(() => jest.clearAllMocks());

  test('201 - registro exitoso devuelve token y usuario sin password', async () => {
    Usuario.findOne.mockResolvedValue(null); // email no existe
    Usuario.create.mockResolvedValue({
      id: 10, name: 'Nuevo User', email: 'nuevo@test.cr',
      role: 'Usuario', status: 'Activo',
      toJSON() { return { id: 10, name: 'Nuevo User', email: 'nuevo@test.cr', role: 'Usuario', status: 'Activo', password: 'x' }; },
    });

    const res = await request(app)
      .post('/auth/register')
      .send({ name: 'Nuevo User', email: 'nuevo@test.cr', password: 'password123' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('user');
    expect(res.body.user).not.toHaveProperty('password'); // nunca devuelve password
    expect(res.body.user.email).toBe('nuevo@test.cr');
  });

  test('400 - faltan campos obligatorios', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ email: 'x@x.cr' }); // sin name ni password

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('409 - email ya registrado', async () => {
    Usuario.findOne.mockResolvedValue({ id: 1, email: 'ya@existe.cr' });

    const res = await request(app)
      .post('/auth/register')
      .send({ name: 'Dup', email: 'ya@existe.cr', password: 'password123' });

    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/ya existe/i);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('POST /auth/login', () => {
  beforeEach(() => jest.clearAllMocks());

  test('200 - login exitoso devuelve token válido y user sin password', async () => {
    Usuario.findOne.mockResolvedValue({
      id: 1, name: 'Admin', email: 'admin@test.cr',
      password: 'admin123', role: 'Administrador', status: 'Activo', roleId: 1,
      rol: { id: 1, nombre: 'Administrador' },
      toJSON() { return { id: 1, name: 'Admin', email: 'admin@test.cr', password: 'admin123', role: 'Administrador', status: 'Activo', roleId: 1 }; },
    });

    // Role.findOne para signToken debe retornar el rol del admin
    const { Role } = require('../models');
    Role.findOne.mockResolvedValue({ id: 1, nombre: 'Administrador' });

    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'admin@test.cr', password: 'admin123' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).not.toHaveProperty('password');
    expect(res.body.user.role).toBe('Administrador');

    // El token debe ser verificable
    const decoded = jwt.verify(res.body.token, process.env.JWT_SECRET);
    expect(decoded.id).toBe(1);
    expect(decoded.role).toBe('Administrador');
  });

  test('400 - body vacío', async () => {
    const res = await request(app).post('/auth/login').send({});
    expect(res.status).toBe(400);
  });

  test('401 - usuario no encontrado', async () => {
    Usuario.findOne.mockResolvedValue(null);
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'noexiste@test.cr', password: '123' });
    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/credenciales/i);
  });

  test('401 - contraseña incorrecta', async () => {
    Usuario.findOne.mockResolvedValue({
      id: 1, email: 'admin@test.cr', password: 'correcta', status: 'Activo',
      toJSON() { return {}; },
    });
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'admin@test.cr', password: 'incorrecta' });
    expect(res.status).toBe(401);
  });

  test('403 - usuario inactivo', async () => {
    Usuario.findOne.mockResolvedValue({
      id: 2, email: 'inactivo@test.cr', password: 'pass', status: 'Inactivo',
      toJSON() { return {}; },
    });
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'inactivo@test.cr', password: 'pass' });
    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/inactiva/i);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('GET /auth/me', () => {
  beforeEach(() => jest.clearAllMocks());

  const validToken = () =>
    jwt.sign({ id: 1, email: 'admin@test.cr', role: 'Administrador' }, process.env.JWT_SECRET, { expiresIn: '1h' });

  test('200 - token válido devuelve perfil sin password', async () => {
    Usuario.findByPk.mockResolvedValue({
      id: 1, name: 'Admin', email: 'admin@test.cr', role: 'Administrador',
      toJSON() { return { id: 1, name: 'Admin', email: 'admin@test.cr', role: 'Administrador', password: 'secret' }; },
    });

    const res = await request(app)
      .get('/auth/me')
      .set('Authorization', `Bearer ${validToken()}`);

    expect(res.status).toBe(200);
    expect(res.body).not.toHaveProperty('password');
    expect(res.body.id).toBe(1);
  });

  // NOTA: los tests "401 sin token / token malformado / token expirado" están
  // cubiertos en middleware.auth.test.js (que prueba el verifyToken real con
  // jest.requireActual). Acá no podemos verificarlos porque setup.js mockea
  // verifyToken con un stub permisivo para no estorbar los tests de controlador.
});
