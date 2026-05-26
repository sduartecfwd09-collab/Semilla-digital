'use strict';
require('./setup');

// ─── Mock de modelos ──────────────────────────────────────────────────────────
// puestoProductorService.mapPuestoParaFrontend espera un objeto con toJSON() que
// devuelva los campos en snake_case del modelo. El mock refleja la estructura
// real de la tabla puestos_productor + sus asociaciones include.
jest.mock('../models', () => {
  const makePuesto = (overrides = {}) => ({
    id: 1,
    usuario_id: 4,
    feria_id: 1,
    nombre_puesto: 'Puesto Orgánico',
    descripcion: 'Puesto de verduras orgánicas',
    telefono: '8888-0001',
    email: 'puesto@test.cr',
    horarios: 'Sábados 6am–12pm',
    horarios_list: null,
    tipos_producto: ['Verduras', 'Frutas'],
    metodos_cultivo: 'Orgánico',
    redes_sociales: '',
    fotos_base64: [],
    fotos_nombres: [],
    datos_extendidos: null,
    fecha_registro: new Date().toISOString(),
    ubicacion: null,
    feriaPrincipal: { id: 1, nombre: 'Feria Cartago' },
    ferias: [],
    usuario: { id: 4, name: 'Juan', nombre: 'Juan', email: 'juan@test.cr', roleId: 2 },
    direccion: null,
    update: jest.fn().mockImplementation(function(data) {
      Object.assign(this, data); return Promise.resolve(this);
    }),
    destroy: jest.fn().mockResolvedValue(),
    toJSON() { return { ...this }; },
    ...overrides,
  });

  return {
    sequelize: {
      authenticate: jest.fn().mockResolvedValue(),
      sync:         jest.fn().mockResolvedValue(),
    },
    PuestoProductor: {
      findAndCountAll: jest.fn(),
      findAll:         jest.fn(),
      findByPk:        jest.fn(),
      findOne:         jest.fn(),
      create:          jest.fn(),
      _make:           makePuesto,
    },
    // PuestoFeria no se usa directamente en estos tests (lo cubre puestoFerias.test.js)
    PuestoFeria: {
      findOrCreate: jest.fn().mockResolvedValue([{ puesto_id: 1, feria_id: 1 }, true]),
      destroy:      jest.fn().mockResolvedValue(1),
    },
    Feria:    { findByPk: jest.fn(), findOne: jest.fn(), create: jest.fn() },
    Usuario:  {},
    Direccion:{},
    Provincia:{},
    Canton:   {},
    Distrito: {},
  };
});

const request = require('supertest');
const app     = require('../app');
const { PuestoProductor, Feria } = require('../models');

// ─── NOTA sobre el interceptor de app.js ─────────────────────────────────────
// En modo test, app.js intercepta res.json y stripea el wrapper {success, data}
// para respuestas exitosas: res.body ES directamente el data.
// Para respuestas de error (success: false), el body NO se stripea y conserva
// { success: false, message, error }.

// ─── GET /puestos ─────────────────────────────────────────────────────────────

describe('GET /puestos — listar todos con paginación', () => {
  beforeEach(() => jest.clearAllMocks());

  test('200 — devuelve lista paginada de puestos', async () => {
    PuestoProductor.findAndCountAll.mockResolvedValue({
      count: 2,
      rows: [
        PuestoProductor._make({ id: 1 }),
        PuestoProductor._make({ id: 2, nombre_puesto: 'Segundo Puesto' }),
      ],
    });

    const res = await request(app).get('/puestos');

    expect(res.status).toBe(200);
    expect(res.body.count).toBe(2);
    expect(res.body.rows).toHaveLength(2);
    // El service mapea snake_case a camelCase
    expect(res.body.rows[0]).toHaveProperty('nombrePuesto', 'Puesto Orgánico');
    expect(res.body.rows[0]).toHaveProperty('usuarioId', 4);
  });

  test('200 — lista vacía cuando no hay puestos', async () => {
    PuestoProductor.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });

    const res = await request(app).get('/puestos');

    expect(res.status).toBe(200);
    expect(res.body.count).toBe(0);
    expect(res.body.rows).toEqual([]);
  });
});

// ─── GET /puestos/:id ─────────────────────────────────────────────────────────

describe('GET /puestos/:id — obtener puesto por ID', () => {
  beforeEach(() => jest.clearAllMocks());

  test('200 — devuelve el puesto con sus campos mapeados', async () => {
    PuestoProductor.findByPk.mockResolvedValue(PuestoProductor._make({ id: 7 }));

    const res = await request(app).get('/puestos/7');

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(7);
    expect(res.body).toHaveProperty('nombrePuesto');
    expect(res.body).toHaveProperty('telefono');
    expect(res.body).toHaveProperty('tiposProducto');
    expect(Array.isArray(res.body.tiposProducto)).toBe(true);
  });

  test('404 — puesto no existe', async () => {
    PuestoProductor.findByPk.mockResolvedValue(null);

    const res = await request(app).get('/puestos/999');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

// ─── GET /puestos/usuario/:usuarioId ─────────────────────────────────────────
// Este es el endpoint que productorService.ts usa desde el frontend tras la
// migración del barrido (reemplazó a getPuestoByUserId de json-server).

describe('GET /puestos/usuario/:usuarioId — puesto del productor por usuario', () => {
  beforeEach(() => jest.clearAllMocks());

  test('200 — devuelve el puesto del usuario con datos completos', async () => {
    PuestoProductor.findOne.mockResolvedValue(
      PuestoProductor._make({
        id: 3, usuario_id: 10,
        nombre_puesto: 'Mi Puesto de Tomates',
        feriaPrincipal: { id: 2, nombre: 'Feria Alajuela' },
      })
    );

    const res = await request(app).get('/puestos/usuario/10');

    expect(res.status).toBe(200);
    expect(res.body.usuarioId).toBe(10);
    expect(res.body.nombrePuesto).toBe('Mi Puesto de Tomates');
    // ubicacion se deriva de feriaPrincipal cuando el campo raw es null
    expect(res.body.ubicacion).toContain('Feria Alajuela');
  });

  test('200 — incluye ferias autorizadas si las tiene', async () => {
    PuestoProductor.findOne.mockResolvedValue(
      PuestoProductor._make({
        id: 4, usuario_id: 11,
        ferias: [
          { id: 1, nombre: 'Feria Zapote' },
          { id: 3, nombre: 'Feria Heredia' },
        ],
      })
    );

    const res = await request(app).get('/puestos/usuario/11');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.ferias)).toBe(true);
    expect(res.body.ferias).toHaveLength(2);
  });

  test('404 — usuario sin puesto registrado', async () => {
    // Usuario que aún no es productor aprobado o no completó el registro
    PuestoProductor.findOne.mockResolvedValue(null);

    const res = await request(app).get('/puestos/usuario/999');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/no tiene un puesto/i);
  });
});

// ─── GET /puestos/feria/:feriaId ─────────────────────────────────────────────

describe('GET /puestos/feria/:feriaId — puestos por feria', () => {
  beforeEach(() => jest.clearAllMocks());

  test('200 — devuelve todos los puestos de esa feria', async () => {
    PuestoProductor.findAll.mockResolvedValue([
      PuestoProductor._make({ id: 1, feria_id: 2 }),
      PuestoProductor._make({ id: 5, feria_id: 2, nombre_puesto: 'Puesto B' }),
    ]);

    const res = await request(app).get('/puestos/feria/2');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(2);
  });

  test('200 — feria sin puestos devuelve lista vacía', async () => {
    PuestoProductor.findAll.mockResolvedValue([]);

    const res = await request(app).get('/puestos/feria/99');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

// ─── POST /puestos ────────────────────────────────────────────────────────────
// Invariante 3c: un productor = un puesto (UNIQUE en usuario_id).

describe('POST /puestos — crear puesto (invariante 1:1)', () => {
  beforeEach(() => jest.clearAllMocks());

  test('201 — crea puesto exitosamente cuando el usuario no tiene ninguno', async () => {
    PuestoProductor.findOne.mockResolvedValue(null); // sin puesto previo
    Feria.findByPk.mockResolvedValue({ id: 1 });
    const created = PuestoProductor._make({ id: 8, usuario_id: 20, nombre_puesto: 'Mi Puesto Nuevo' });
    PuestoProductor.create.mockResolvedValue(created);

    const res = await request(app)
      .post('/puestos')
      .send({
        usuarioId: 20,
        nombrePuesto: 'Mi Puesto Nuevo',
        feriaId: 1,
        descripcion: 'Verduras y frutas',
        telefono: '7777-2222',
        email: 'nuevo@test.cr',
      });

    expect(res.status).toBe(201);
    expect(PuestoProductor.create).toHaveBeenCalled();
    expect(res.body).toHaveProperty('nombrePuesto');
  });

  test('400 — rechaza si el usuario ya tiene un puesto (UNIQUE usuario_id)', async () => {
    // El service llama findOne primero para verificar el constraint 1:1.
    PuestoProductor.findOne.mockResolvedValue(PuestoProductor._make({ usuario_id: 4 }));

    const res = await request(app)
      .post('/puestos')
      .send({ usuarioId: 4, nombrePuesto: 'Segundo Puesto', feriaId: 1 });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/ya tiene un puesto/i);
    expect(PuestoProductor.create).not.toHaveBeenCalled();
  });

  test('400 — rechaza si falta nombre del puesto', async () => {
    PuestoProductor.findOne.mockResolvedValue(null);

    const res = await request(app)
      .post('/puestos')
      .send({ usuarioId: 5 }); // sin nombrePuesto

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/nombre del puesto/i);
    expect(PuestoProductor.create).not.toHaveBeenCalled();
  });

  test('400 — rechaza si falta el usuario', async () => {
    const res = await request(app)
      .post('/puestos')
      .send({ nombrePuesto: 'Sin usuario' });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/usuario/i);
  });
});

// ─── PUT /puestos/:id ─────────────────────────────────────────────────────────

describe('PUT /puestos/:id — actualizar puesto', () => {
  beforeEach(() => jest.clearAllMocks());

  test('200 — actualiza campos del puesto', async () => {
    const p = PuestoProductor._make({ id: 2 });
    PuestoProductor.findByPk.mockResolvedValue(p);

    const res = await request(app)
      .put('/puestos/2')
      .send({ nombrePuesto: 'Puesto Actualizado', telefono: '6666-3333' });

    expect(res.status).toBe(200);
    expect(p.update).toHaveBeenCalled();
    expect(res.body).toHaveProperty('nombrePuesto');
  });

  test('404 — puesto no existe', async () => {
    PuestoProductor.findByPk.mockResolvedValue(null);

    const res = await request(app)
      .put('/puestos/999')
      .send({ nombrePuesto: 'X' });

    expect(res.status).toBe(404);
  });
});

// ─── DELETE /puestos/:id ──────────────────────────────────────────────────────

describe('DELETE /puestos/:id — eliminar puesto (solo admin)', () => {
  beforeEach(() => jest.clearAllMocks());

  test('200 — admin elimina puesto existente', async () => {
    const p = PuestoProductor._make({ id: 3 });
    PuestoProductor.findByPk.mockResolvedValue(p);

    const res = await request(app).delete('/puestos/3');

    expect(res.status).toBe(200);
    expect(p.destroy).toHaveBeenCalled();
    expect(res.body.message).toMatch(/eliminado/i);
  });

  test('404 — intento de eliminar puesto que no existe', async () => {
    PuestoProductor.findByPk.mockResolvedValue(null);

    const res = await request(app).delete('/puestos/999');

    expect(res.status).toBe(404);
  });
});
