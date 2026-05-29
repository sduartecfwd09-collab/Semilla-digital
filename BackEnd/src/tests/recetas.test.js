'use strict';
require('./setup');

jest.mock('../models', () => {
  const mockReceta = (overrides = {}) => ({
    id: 1, title: 'Sopa de Zanahoria', description: 'Rica sopa',
    ingredients: ['zanahoria', 'papa'], steps: ['Pelar', 'Hervir'],
    difficulty: 'Fácil', time: '30 min',
    update: jest.fn().mockImplementation(function(data) { Object.assign(this, data); return Promise.resolve(this); }),
    destroy: jest.fn().mockResolvedValue(),
    toJSON() {
      return { id: this.id, title: this.title, description: this.description,
        ingredients: this.ingredients, steps: this.steps,
        difficulty: this.difficulty, time: this.time };
    },
    ...overrides,
  });

  return {
    sequelize: { authenticate: jest.fn().mockResolvedValue(), sync: jest.fn().mockResolvedValue() },
    Receta: {
      findAll:  jest.fn(),
      findByPk: jest.fn(),
      create:   jest.fn(),
      _mock: mockReceta,
    },
  };
});

const request = require('supertest');
const app     = require('../app');
const { Receta } = require('../models');

// Recetas son públicas
describe('GET /recetas', () => {
  beforeEach(() => jest.clearAllMocks());

  test('200 - devuelve lista de recetas sin token', async () => {
    Receta.findAll.mockResolvedValue([Receta._mock(), Receta._mock({ id: 2, title: 'Batido' })]);
    const res = await request(app).get('/recetas');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0]).toHaveProperty('ingredients');
    expect(res.body[0]).toHaveProperty('steps');
  });
});

describe('GET /recetas/:id', () => {
  beforeEach(() => jest.clearAllMocks());

  test('200 - devuelve receta con ingredientes y pasos como arrays', async () => {
    Receta.findByPk.mockResolvedValue(Receta._mock({ id: 1 }));
    const res = await request(app).get('/recetas/1');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.ingredients)).toBe(true);
    expect(Array.isArray(res.body.steps)).toBe(true);
  });

  test('404 - receta no encontrada', async () => {
    Receta.findByPk.mockResolvedValue(null);
    const res = await request(app).get('/recetas/999');
    expect(res.status).toBe(404);
  });
});

describe('POST /recetas', () => {
  beforeEach(() => jest.clearAllMocks());

  test('201 - crea receta con strings separados por coma/salto de línea', async () => {
    Receta.create.mockResolvedValue(Receta._mock({ id: 5, title: 'Batido de Banano' }));

    const res = await request(app)
      .post('/recetas')
      .send({
        title: 'Batido de Banano',
        description: 'Rápido y nutritivo',
        ingredients: 'banano, leche, azúcar',  // string separado por comas
        steps: 'Pelar el banano\nLicuar todo\nServir frío', // string separado por \n
        difficulty: 'Fácil',
        time: '10',
      });

    expect(res.status).toBe(201);
    // El controller debe agregar "min" al tiempo si no viene
    expect(Receta.create).toHaveBeenCalledWith(
      expect.objectContaining({
        time: '10 min',
        ingredients: expect.arrayContaining(['banano', 'leche', 'azúcar']),
        steps: expect.arrayContaining(['Pelar el banano', 'Licuar todo', 'Servir frío']),
      })
    );
  });

  test('201 - crea receta con arrays directamente', async () => {
    Receta.create.mockResolvedValue(Receta._mock({ id: 6 }));

    const res = await request(app)
      .post('/recetas')
      .send({
        title: 'Ensalada', description: 'Fresca',
        ingredients: ['lechuga', 'tomate'],
        steps: ['Lavar', 'Cortar', 'Servir'],
        difficulty: 'Fácil',
        time: '15 min',
      });

    expect(res.status).toBe(201);
  });

  test('201 - acepta imagen subida por Cloudinary e ignora campos extra', async () => {
    Receta.create.mockResolvedValue(Receta._mock({ id: 7 }));

    const res = await request(app)
      .post('/recetas')
      .send({
        title: 'Receta QA',
        description: 'Prueba',
        ingredients: ['tomate'],
        steps: ['lavar'],
        difficulty: 'FÃ¡cil',
        time: '12',
        image_url: 'https://res.cloudinary.com/demo/image/upload/recetas/imagen.jpg',
        campo_inexistente: 'no debe guardarse',
      });

    expect(res.status).toBe(201);
    expect(Receta.create.mock.calls[0][0]).toHaveProperty('image_url', 'https://res.cloudinary.com/demo/image/upload/recetas/imagen.jpg');
    expect(Receta.create.mock.calls[0][0]).not.toHaveProperty('campo_inexistente');
  });

  test('201 - acepta titulo como alias de title', async () => {
    Receta.create.mockResolvedValue(Receta._mock({ id: 8 }));

    const res = await request(app)
      .post('/recetas')
      .send({
        titulo: 'Receta con alias',
        description: 'Prueba',
        ingredients: ['tomate'],
        steps: ['lavar'],
        difficulty: 'FÃ¡cil',
        time: '12',
      });

    expect(res.status).toBe(201);
    expect(Receta.create.mock.calls[0][0]).toHaveProperty('title', 'Receta con alias');
  });

  test('400 - campos obligatorios faltantes', async () => {
    const res = await request(app)
      .post('/recetas')
      .send({ title: 'Incompleta', description: 'Sin ingredientes' });
    expect(res.status).toBe(400);
  });
});

describe('PUT /recetas/:id', () => {
  beforeEach(() => jest.clearAllMocks());

  test('200 - actualiza receta completa', async () => {
    const r = Receta._mock({ id: 1 });
    Receta.findByPk.mockResolvedValue(r);

    const res = await request(app)
      .put('/recetas/1')
      .send({
        title: 'Sopa Actualizada', description: 'Nueva descripción',
        ingredients: ['zanahoria', 'apio'], steps: ['Hervir', 'Servir'],
        difficulty: 'Media', time: '40 min',
      });

    expect(res.status).toBe(200);
    expect(r.update).toHaveBeenCalled();
  });

  test('404 - receta no encontrada', async () => {
    Receta.findByPk.mockResolvedValue(null);
    const res = await request(app).put('/recetas/999').send({ title: 'X' });
    expect(res.status).toBe(404);
  });
});

describe('DELETE /recetas/:id', () => {
  beforeEach(() => jest.clearAllMocks());

  test('200 - elimina receta', async () => {
    const r = Receta._mock({ id: 2 });
    Receta.findByPk.mockResolvedValue(r);
    const res = await request(app).delete('/recetas/2');
    expect(res.status).toBe(200);
    expect(r.destroy).toHaveBeenCalled();
  });

  test('404 - receta inexistente', async () => {
    Receta.findByPk.mockResolvedValue(null);
    const res = await request(app).delete('/recetas/999');
    expect(res.status).toBe(404);
  });
});
