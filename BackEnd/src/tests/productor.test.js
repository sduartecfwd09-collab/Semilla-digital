'use strict';
require('./setup');

jest.mock('../models', () => {
  const mockFeria = (overrides = {}) => ({
    id: 1,
    nombre: 'Feria Cartago',
    direccion: { provincia: { nombre: 'Cartago' } },
    toJSON() {
      return {
        id: this.id, nombre: this.nombre, direccion: this.direccion,
      };
    },
    ...overrides,
  });

  return {
    sequelize: {
      authenticate: jest.fn().mockResolvedValue(),
      sync: jest.fn().mockResolvedValue(),
    },
    PuestoProductor: {
      findOne: jest.fn(),
    },
    // Modelos referenciados por el include del service, sin uso directo en tests.
    Feria: { _mock: mockFeria },
    Direccion: {},
    Provincia: {},
    Canton: {},
    Distrito: {},
    PuestoFeria: {},
  };
});

const request = require('supertest');
const app = require('../app');
const { PuestoProductor, Feria } = require('../models');

describe('GET /productores/me/ferias', () => {
  beforeEach(() => jest.clearAllMocks());

  test('200 - productor con ferias autorizadas devuelve la lista', async () => {
    // El service hace puesto.ferias.map(...) directamente, así que el mock del
    // puesto debe exponer un array `ferias`.
    PuestoProductor.findOne.mockResolvedValue({
      id: 7,
      usuario_id: 1,
      ferias: [
        Feria._mock({ id: 1, nombre: 'Feria Zapote' }),
        Feria._mock({ id: 4, nombre: 'Feria Palmares', direccion: { provincia: { nombre: 'Alajuela' } } }),
      ],
    });

    const res = await request(app).get('/productores/me/ferias');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(2);
    expect(res.body.map(f => f.nombre)).toEqual(['Feria Zapote', 'Feria Palmares']);
    // El service usa el usuario_id del token (setup.js fuerza id=1)
    expect(PuestoProductor.findOne).toHaveBeenCalledWith(
      expect.objectContaining({ where: { usuario_id: 1 } })
    );
  });

  test('200 - usuario sin puesto devuelve lista vacía (no 404)', async () => {
    // No es error: un usuario que aún no es productor aprobado simplemente
    // no tiene ferias autorizadas. Frontend muestra estado vacío.
    PuestoProductor.findOne.mockResolvedValue(null);

    const res = await request(app).get('/productores/me/ferias');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  test('200 - productor con puesto pero sin ferias asignadas devuelve []', async () => {
    PuestoProductor.findOne.mockResolvedValue({ id: 7, usuario_id: 1, ferias: [] });

    const res = await request(app).get('/productores/me/ferias');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});
