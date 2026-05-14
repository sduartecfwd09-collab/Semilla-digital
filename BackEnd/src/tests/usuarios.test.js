'use strict';
require('./setup');

jest.mock('../models', () => {
  const mockUser = (overrides = {}) => ({
    id: 1, name: 'Carlos', email: 'carlos@test.cr',
    password: 'pass', role: 'Agricultor', status: 'Activo',
    update: jest.fn().mockImplementation(function(data) { Object.assign(this, data); return Promise.resolve(this); }),
    destroy: jest.fn().mockResolvedValue(),
    toJSON() { return { id: this.id, name: this.name, email: this.email, role: this.role, status: this.status }; },
    ...overrides,
  });

  return {
    sequelize: { authenticate: jest.fn().mockResolvedValue(), sync: jest.fn().mockResolvedValue() },
    Usuario: {
      findAll:  jest.fn(),
      findByPk: jest.fn(),
      findOne:  jest.fn(),
      create:   jest.fn(),
      _mockUser: mockUser,
    },
  };
});

const request = require('supertest');
const jwt     = require('jsonwebtoken');
const app     = require('../app');
const { Usuario } = require('../models');

// Helper: genera token de admin para rutas protegidas
const adminToken = () =>
  jwt.sign({ id: 99, email: 'admin@test.cr', role: 'Administrador' }, process.env.JWT_SECRET, { expiresIn: '1h' });

const authHeader = () => ({ Authorization: `Bearer ${adminToken()}` });

// ─────────────────────────────────────────────────────────────────────────────
describe('GET /usuarios', () => {
  beforeEach(() => jest.clearAllMocks());

  test('200 - devuelve lista de usuarios', async () => {
    Usuario.findAll.mockResolvedValue([
      Usuario._mockUser({ id: 1, name: 'Carlos' }),
      Usuario._mockUser({ id: 2, name: 'María', email: 'maria@test.cr' }),
    ]);

    const res = await request(app).get('/usuarios').set(authHeader());
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0]).toHaveProperty('name');
  });

  test('401 - sin token devuelve 401', async () => {
    const res = await request(app).get('/usuarios');
    expect(res.status).toBe(401);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('GET /usuarios/:id', () => {
  beforeEach(() => jest.clearAllMocks());

  test('200 - devuelve usuario existente', async () => {
    Usuario.findByPk.mockResolvedValue(Usuario._mockUser({ id: 5, name: 'Luis' }));
    const res = await request(app).get('/usuarios/5').set(authHeader());
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(5);
  });

  test('404 - usuario no encontrado', async () => {
    Usuario.findByPk.mockResolvedValue(null);
    const res = await request(app).get('/usuarios/999').set(authHeader());
    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/no encontrado/i);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('POST /usuarios', () => {
  beforeEach(() => jest.clearAllMocks());

  test('201 - crea usuario correctamente', async () => {
    Usuario.findOne.mockResolvedValue(null);
    Usuario.create.mockResolvedValue(Usuario._mockUser({ id: 7, name: 'Nuevo' }));

    const res = await request(app)
      .post('/usuarios')
      .set(authHeader())
      .send({ name: 'Nuevo', email: 'nuevo@test.cr', password: 'pass123' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
  });

  test('400 - faltan campos obligatorios', async () => {
    const res = await request(app)
      .post('/usuarios')
      .set(authHeader())
      .send({ email: 'x@x.cr' });
    expect(res.status).toBe(400);
  });

  test('409 - email duplicado', async () => {
    Usuario.findOne.mockResolvedValue({ id: 3, email: 'dup@test.cr' });
    const res = await request(app)
      .post('/usuarios')
      .set(authHeader())
      .send({ name: 'Dup', email: 'dup@test.cr', password: '123' });
    expect(res.status).toBe(409);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('PATCH /usuarios/:id', () => {
  beforeEach(() => jest.clearAllMocks());

  test('200 - actualiza role correctamente', async () => {
    const u = Usuario._mockUser({ id: 4, role: 'Usuario' });
    Usuario.findByPk.mockResolvedValue(u);
    Usuario.findOne.mockResolvedValue(null);

    const res = await request(app)
      .patch('/usuarios/4')
      .set(authHeader())
      .send({ role: 'Agricultor' });

    expect(res.status).toBe(200);
    expect(u.update).toHaveBeenCalledWith(expect.objectContaining({ role: 'Agricultor' }));
  });

  test('404 - usuario no existe', async () => {
    Usuario.findByPk.mockResolvedValue(null);
    const res = await request(app).patch('/usuarios/999').set(authHeader()).send({ role: 'Agricultor' });
    expect(res.status).toBe(404);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('DELETE /usuarios/:id', () => {
  beforeEach(() => jest.clearAllMocks());

  test('200 - elimina usuario existente', async () => {
    const u = Usuario._mockUser({ id: 8 });
    Usuario.findByPk.mockResolvedValue(u);

    const res = await request(app).delete('/usuarios/8').set(authHeader());
    expect(res.status).toBe(200);
    expect(u.destroy).toHaveBeenCalled();
    expect(res.body.message).toMatch(/eliminado/i);
  });

  test('404 - usuario no encontrado', async () => {
    Usuario.findByPk.mockResolvedValue(null);
    const res = await request(app).delete('/usuarios/999').set(authHeader());
    expect(res.status).toBe(404);
  });
});
