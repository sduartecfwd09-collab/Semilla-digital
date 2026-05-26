'use strict';
require('./setup');

// ─── Mock de modelos ──────────────────────────────────────────────────────────
// Misma estructura que productos.test.js + OfertaProducto.destroy para la rama
// de reemplazo de precios que usa productoService.update.
jest.mock('../models', () => {
  const mockPrecio = (overrides = {}) => ({
    id: 1, productoId: 1, feriaId: 1,
    feriaNombre: 'Feria Test', provincia: 'Cartago', precio: 800,
    ...overrides,
  });

  const mockProducto = (overrides = {}) => {
    const precios = overrides.precios || [mockPrecio()];
    return {
      id: 1, user_id: 2, nombre: 'Zanahoria', emoji: '🥕',
      descripcion: 'Fresca', categoria: 'Verduras',
      disponible: true, unidad: 'Kilogramo', provincia: 'Cartago',
      update: jest.fn().mockImplementation(function(data) {
        Object.assign(this, data); return Promise.resolve(this);
      }),
      destroy: jest.fn().mockResolvedValue(),
      get: jest.fn().mockImplementation(function() {
        return { id: this.id, user_id: this.user_id, nombre: this.nombre,
          emoji: this.emoji, categoria: this.categoria,
          disponible: this.disponible, usuario: null, ofertas: [] };
      }),
      toJSON() {
        return { id: this.id, user_id: this.user_id, nombre: this.nombre,
          emoji: this.emoji, categoria: this.categoria,
          disponible: this.disponible, precios };
      },
      ...overrides,
    };
  };

  return {
    sequelize: {
      authenticate: jest.fn().mockResolvedValue(),
      sync:         jest.fn().mockResolvedValue(),
      // productoService.update envuelve los precios en una transacción y llama
      // assertAutorizadoEnFeria vía sequelize.query. Por defecto: productor
      // autorizado (devuelve una fila). Tests de 403 lo overridean con [].
      transaction: jest.fn().mockImplementation(async (cb) => cb({})),
      query:       jest.fn().mockResolvedValue([{ '1': 1 }]),
    },
    Producto: {
      findAll:  jest.fn(),
      findByPk: jest.fn(),
      create:   jest.fn(),
      _mock:    mockProducto,
    },
    OfertaProducto: {
      create:  jest.fn().mockResolvedValue(mockPrecio()),
      destroy: jest.fn().mockResolvedValue(1),
      _mock:   mockPrecio,
    },
    // Modelos requeridos por los includes de findById al final del update.
    Usuario:   {},
    Feria:     {},
    Direccion: {},
    Provincia: {},
  };
});

const request = require('supertest');
const app     = require('../app');
const { sequelize, Producto, OfertaProducto } = require('../models');

// ─── NOTA sobre el interceptor de app.js ─────────────────────────────────────
// En modo test, el wrapper {success, data} se stripea para respuestas exitosas:
// res.body ES directamente el data. Para 4xx (success: false), el body se conserva.
//
// NOTA sobre req.params.id: Express lo expone siempre como string ('5', no 5).
// Las aserciones sobre producto_id en OfertaProducto.destroy deben usar string.

// ─── PUT /productos/:id ───────────────────────────────────────────────────────

describe('PUT /productos/:id — actualización con validación de autorización por feria', () => {
  beforeEach(() => jest.clearAllMocks());

  test('200 — actualiza producto con precios en feria autorizada', async () => {
    const existing = Producto._mock({ id: 5, nombre: 'Zanahoria' });
    const updated  = Producto._mock({ id: 5, nombre: 'Zanahoria Orgánica' });

    // Setup.js inyecta rol Administrador → el controller no llama findById propio.
    // findByPk #1: productoService.update (verifica existencia)
    // findByPk #2: productoService.findById al final del update (retorno enriquecido)
    Producto.findByPk
      .mockResolvedValueOnce(existing)
      .mockResolvedValueOnce(updated);

    const res = await request(app)
      .put('/productos/5')
      .send({
        userId: 2,
        nombre: 'Zanahoria Orgánica',
        precios: [{ feriaId: 1, feriaNombre: 'Feria Test', precio: 900 }],
      });

    expect(res.status).toBe(200);
    // La autorización fue consultada exactamente una vez (una feria en precios)
    expect(sequelize.query).toHaveBeenCalledTimes(1);
    // Las ofertas viejas se borraron — req.params.id llega como string '5'
    expect(OfertaProducto.destroy).toHaveBeenCalledWith(
      expect.objectContaining({ where: { producto_id: '5' } })
    );
    expect(OfertaProducto.create).toHaveBeenCalledTimes(1);
    expect(existing.update).toHaveBeenCalled();
  });

  test('200 — actualiza solo campos de texto (sin precios) — NO invoca assertAutorizadoEnFeria', async () => {
    const existing = Producto._mock({ id: 3 });
    // findByPk #1: update, #2: findById
    Producto.findByPk
      .mockResolvedValueOnce(existing)
      .mockResolvedValueOnce(existing);

    const res = await request(app)
      .put('/productos/3')
      .send({ descripcion: 'Nueva descripción del producto', disponible: false });

    expect(res.status).toBe(200);
    // Sin precios en el body, la transacción y la query de auth no se disparan
    expect(sequelize.query).not.toHaveBeenCalled();
    expect(OfertaProducto.destroy).not.toHaveBeenCalled();
    expect(existing.update).toHaveBeenCalledWith(
      expect.objectContaining({ descripcion: 'Nueva descripción del producto' })
    );
  });

  test('403 — rechaza actualización cuando el productor no está autorizado en la feria', async () => {
    const existing = Producto._mock({ id: 8, user_id: 5 });
    Producto.findByPk.mockResolvedValueOnce(existing);

    // Simular que el productor no tiene puesto en puesto_ferias para esa feria
    sequelize.query.mockResolvedValueOnce([]);

    const res = await request(app)
      .put('/productos/8')
      .send({
        precios: [{ feriaId: 99, feriaNombre: 'Feria Lejana', precio: 700 }],
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/autorizad/i);
    // No debe haber borrado ni creado ofertas
    expect(OfertaProducto.destroy).not.toHaveBeenCalled();
    expect(OfertaProducto.create).not.toHaveBeenCalled();
    expect(existing.update).not.toHaveBeenCalled();
  });

  test('403 — invariante aplica también cuando admin edita producto de otro productor no autorizado', async () => {
    // El invariante es de negocio: el productor dueño del producto debe estar
    // autorizado en la feria, independientemente de quién dispara la request.
    const existing = Producto._mock({ id: 9, user_id: 7 }); // productor 7
    Producto.findByPk.mockResolvedValueOnce(existing);
    sequelize.query.mockResolvedValueOnce([]); // productor 7 no tiene esa feria

    const res = await request(app)
      .put('/productos/9')
      .send({ precios: [{ feriaId: 10, precio: 500 }] });

    expect(res.status).toBe(403);
  });

  test('404 — producto no existe', async () => {
    Producto.findByPk.mockResolvedValueOnce(null);

    const res = await request(app)
      .put('/productos/999')
      .send({ nombre: 'Cualquier cosa' });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  test('400 — precio sin feriaId lanza error antes de consultar autorización', async () => {
    const existing = Producto._mock({ id: 4 });
    Producto.findByPk.mockResolvedValueOnce(existing);

    const res = await request(app)
      .put('/productos/4')
      .send({ precios: [{ precio: 500 }] }); // sin feriaId

    expect(res.status).toBe(400);
    // assertAutorizadoEnFeria nunca debería haberse ejecutado
    expect(sequelize.query).not.toHaveBeenCalled();
  });
});

// ─── PATCH /productos/:id/disponible ─────────────────────────────────────────
// Toggle de disponibilidad: no toca precios ni ferias, no invoca assertAutorizadoEnFeria.

describe('PATCH /productos/:id/disponible — toggle de disponibilidad', () => {
  beforeEach(() => jest.clearAllMocks());

  test('200 — cambia disponible a false cuando estaba en true', async () => {
    const p = Producto._mock({ id: 2, disponible: true });
    Producto.findByPk.mockResolvedValue(p);

    const res = await request(app).patch('/productos/2/disponible');

    expect(res.status).toBe(200);
    expect(p.update).toHaveBeenCalledWith({ disponible: false });
    expect(sequelize.query).not.toHaveBeenCalled();
  });

  test('200 — cambia disponible a true cuando estaba en false', async () => {
    const p = Producto._mock({ id: 6, disponible: false });
    Producto.findByPk.mockResolvedValue(p);

    const res = await request(app).patch('/productos/6/disponible');

    expect(res.status).toBe(200);
    expect(p.update).toHaveBeenCalledWith({ disponible: true });
  });

  test('404 — producto no existe', async () => {
    Producto.findByPk.mockResolvedValue(null);
    const res = await request(app).patch('/productos/999/disponible');
    expect(res.status).toBe(404);
  });
});
