'use strict';
require('./setup');

jest.mock('../models', () => {
  const mockFeria = (overrides = {}) => ({
    id: 1, nombre: 'Feria Cartago', provincia: 'Cartago',
    direccion: 'Centro', dias: 'Sábados', horario: '05:00 - 12:00',
    update: jest.fn().mockImplementation(function(data) { Object.assign(this, data); return Promise.resolve(this); }),
    destroy: jest.fn().mockResolvedValue(),
    toJSON() { return { id: this.id, nombre: this.nombre, provincia: this.provincia, dias: this.dias, horario: this.horario }; },
    ...overrides,
  });

  return {
    sequelize: { authenticate: jest.fn().mockResolvedValue(), sync: jest.fn().mockResolvedValue() },
    Feria: {
      findAll:  jest.fn(),
      findByPk: jest.fn(),
      create:   jest.fn(),
      // findOrCreate devuelve [instancia, creado]. Por defecto simulamos
      // "creó nueva" para que los tests POST validen el flujo de creación.
      findOrCreate: jest.fn().mockImplementation(({ defaults }) =>
        Promise.resolve([mockFeria(defaults), true])
      ),
      _mock: mockFeria,
    },
  };
});

const request = require('supertest');
const app     = require('../app');
const { Feria } = require('../models');

// Ferias son públicas: no requieren token
describe('GET /ferias', () => {
  beforeEach(() => jest.clearAllMocks());

  test('200 - devuelve lista sin necesitar token', async () => {
    Feria.findAll.mockResolvedValue([
      Feria._mock({ id: 1, nombre: 'Feria Cartago' }),
      Feria._mock({ id: 2, nombre: 'Feria Heredia', provincia: 'Heredia' }),
    ]);
    const res = await request(app).get('/ferias');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0]).toHaveProperty('nombre');
  });

  test('200 - lista vacía si no hay ferias', async () => {
    Feria.findAll.mockResolvedValue([]);
    const res = await request(app).get('/ferias');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

describe('GET /ferias/:id', () => {
  beforeEach(() => jest.clearAllMocks());

  test('200 - devuelve feria por id', async () => {
    Feria.findByPk.mockResolvedValue(Feria._mock({ id: 3, nombre: 'Feria San José' }));
    const res = await request(app).get('/ferias/3');
    expect(res.status).toBe(200);
    expect(res.body.nombre).toBe('Feria San José');
  });

  test('404 - feria inexistente', async () => {
    Feria.findByPk.mockResolvedValue(null);
    const res = await request(app).get('/ferias/999');
    expect(res.status).toBe(404);
  });
});

describe('POST /ferias', () => {
  beforeEach(() => jest.clearAllMocks());

  test('201 - crea feria con campos correctos', async () => {
    Feria.create.mockResolvedValue(Feria._mock({ id: 5, nombre: 'Nueva Feria' }));
    const res = await request(app)
      .post('/ferias')
      .send({ nombre: 'Nueva Feria', provincia: 'Alajuela', dias: 'Viernes', horario: '06:00 - 12:00' });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
  });

  test('201 - acepta campos en formato name/province (sync Google)', async () => {
    Feria.create.mockResolvedValue(Feria._mock({ id: 6, nombre: 'Feria Google' }));
    const res = await request(app)
      .post('/ferias')
      .send({ name: 'Feria Google', province: 'Heredia', schedule: 'Sábados, 05:00 - 12:00' });
    expect(res.status).toBe(201);
  });

  test('400 - sin nombre devuelve error', async () => {
    const res = await request(app).post('/ferias').send({ provincia: 'Cartago' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});

describe('PUT /ferias/:id', () => {
  beforeEach(() => jest.clearAllMocks());

  test('200 - actualiza feria existente', async () => {
    const f = Feria._mock({ id: 1 });
    Feria.findByPk.mockResolvedValue(f);
    const res = await request(app)
      .put('/ferias/1')
      .send({ nombre: 'Feria Actualizada', provincia: 'Cartago', dias: 'Domingos', horario: '06:00 - 13:00' });
    expect(res.status).toBe(200);
    expect(f.update).toHaveBeenCalled();
  });

  test('404 - feria no encontrada', async () => {
    Feria.findByPk.mockResolvedValue(null);
    const res = await request(app).put('/ferias/999').send({ nombre: 'X', provincia: 'Cartago' });
    expect(res.status).toBe(404);
  });
});

describe('DELETE /ferias/:id', () => {
  beforeEach(() => jest.clearAllMocks());

  test('200 - elimina feria', async () => {
    const f = Feria._mock({ id: 2 });
    Feria.findByPk.mockResolvedValue(f);
    const res = await request(app).delete('/ferias/2');
    expect(res.status).toBe(200);
    expect(f.destroy).toHaveBeenCalled();
  });

  test('404 - feria inexistente', async () => {
    Feria.findByPk.mockResolvedValue(null);
    const res = await request(app).delete('/ferias/999');
    expect(res.status).toBe(404);
  });
});
