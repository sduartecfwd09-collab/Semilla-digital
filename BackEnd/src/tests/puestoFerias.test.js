'use strict';
require('./setup');

jest.mock('../models', () => {
  const makePuesto = (overrides = {}) => ({
    id: 7,
    usuario_id: 4,
    feria_id: 1, // feria principal
    nombre_puesto: 'Puesto Test',
    toJSON() {
      return {
        id: this.id, usuario_id: this.usuario_id, feria_id: this.feria_id,
        nombre_puesto: this.nombre_puesto,
        ferias: this.ferias || [],
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
      findByPk: jest.fn(),
      findOne: jest.fn(),
      findAll: jest.fn(),
      findAndCountAll: jest.fn(),
      _makePuesto: makePuesto,
    },
    PuestoFeria: {
      findOrCreate: jest.fn().mockResolvedValue([{ puesto_id: 7, feria_id: 2 }, true]),
      destroy: jest.fn().mockResolvedValue(1),
    },
    Feria: {
      findByPk: jest.fn(),
    },
    Usuario: {},
    Direccion: {},
    Provincia: {},
    Canton: {},
    Distrito: {},
  };
});

const request = require('supertest');
const app = require('../app');
const { PuestoProductor, PuestoFeria, Feria } = require('../models');

describe('POST /puestos/:id/ferias (admin agrega feria autorizada)', () => {
  beforeEach(() => jest.clearAllMocks());

  test('200 - admin agrega feria nueva al puesto', async () => {
    PuestoProductor.findByPk.mockResolvedValueOnce(PuestoProductor._makePuesto());
    Feria.findByPk.mockResolvedValueOnce({ id: 2, nombre: 'Feria Alajuela' });
    // segundo findByPk del findById final
    PuestoProductor.findByPk.mockResolvedValueOnce(PuestoProductor._makePuesto({
      ferias: [{ id: 1 }, { id: 2 }],
    }));

    const res = await request(app)
      .post('/puestos/7/ferias')
      .send({ feriaId: 2 });

    expect(res.status).toBe(200);
    expect(PuestoFeria.findOrCreate).toHaveBeenCalledWith(
      expect.objectContaining({ where: { puesto_id: 7, feria_id: 2 } })
    );
  });

  test('200 - agregar feria duplicada es idempotente (findOrCreate no falla)', async () => {
    PuestoProductor.findByPk.mockResolvedValueOnce(PuestoProductor._makePuesto());
    Feria.findByPk.mockResolvedValueOnce({ id: 1, nombre: 'Feria Zapote' });
    PuestoProductor.findByPk.mockResolvedValueOnce(PuestoProductor._makePuesto({
      ferias: [{ id: 1 }],
    }));
    // findOrCreate devuelve [instancia, false] cuando ya existía
    PuestoFeria.findOrCreate.mockResolvedValueOnce([{ puesto_id: 7, feria_id: 1 }, false]);

    const res = await request(app)
      .post('/puestos/7/ferias')
      .send({ feriaId: 1 });

    expect(res.status).toBe(200);
  });

  test('400 - sin feriaId en el body', async () => {
    const res = await request(app).post('/puestos/7/ferias').send({});
    expect(res.status).toBe(400);
  });

  test('404 - puesto no existe', async () => {
    PuestoProductor.findByPk.mockResolvedValueOnce(null);
    const res = await request(app).post('/puestos/999/ferias').send({ feriaId: 2 });
    expect(res.status).toBe(404);
  });

  test('404 - feria no existe', async () => {
    PuestoProductor.findByPk.mockResolvedValueOnce(PuestoProductor._makePuesto());
    Feria.findByPk.mockResolvedValueOnce(null);
    const res = await request(app).post('/puestos/7/ferias').send({ feriaId: 999 });
    expect(res.status).toBe(404);
  });
});

describe('DELETE /puestos/:id/ferias/:feriaId (admin quita feria autorizada)', () => {
  beforeEach(() => jest.clearAllMocks());

  test('200 - admin quita feria secundaria', async () => {
    // feria principal = 1, queremos quitar la 2 (autorizada extra)
    PuestoProductor.findByPk.mockResolvedValueOnce(PuestoProductor._makePuesto());
    PuestoProductor.findByPk.mockResolvedValueOnce(PuestoProductor._makePuesto({
      ferias: [{ id: 1 }],
    }));

    const res = await request(app).delete('/puestos/7/ferias/2');

    expect(res.status).toBe(200);
    expect(PuestoFeria.destroy).toHaveBeenCalledWith(
      expect.objectContaining({ where: { puesto_id: 7, feria_id: '2' } })
    );
  });

  test('409 - bloquea quitar la feria principal del puesto', async () => {
    // feria_id principal = 1, intento quitar la 1
    PuestoProductor.findByPk.mockResolvedValueOnce(PuestoProductor._makePuesto());

    const res = await request(app).delete('/puestos/7/ferias/1');

    expect(res.status).toBe(409);
    expect(res.body.message).toMatch(/principal/i);
    expect(PuestoFeria.destroy).not.toHaveBeenCalled();
  });

  test('404 - puesto no existe', async () => {
    PuestoProductor.findByPk.mockResolvedValueOnce(null);
    const res = await request(app).delete('/puestos/999/ferias/2');
    expect(res.status).toBe(404);
  });

  test('404 - la feria no estaba autorizada para este puesto', async () => {
    PuestoProductor.findByPk.mockResolvedValueOnce(PuestoProductor._makePuesto());
    PuestoFeria.destroy.mockResolvedValueOnce(0);

    const res = await request(app).delete('/puestos/7/ferias/5');

    expect(res.status).toBe(404);
    expect(res.body.message).toMatch(/no estaba autorizada/i);
  });
});
