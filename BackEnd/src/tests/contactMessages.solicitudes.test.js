'use strict';
// Configuración de env para tests (sin bypass de auth)
process.env.NODE_ENV    = 'test';
process.env.JWT_SECRET  = 'agromap_test_secret_key_12345';
process.env.JWT_EXPIRES_IN = '1h';
process.env.DB_NAME     = 'test_db';
process.env.DB_USER     = 'test';
process.env.DB_PASSWORD = 'test';
process.env.DB_HOST     = 'localhost';
process.env.DB_PORT     = '3306';
process.env.DB_DIALECT  = 'mysql';

jest.mock('../models', () => {
  const mockMsg = (overrides = {}) => ({
    id: 1, nombre: 'Ana', correo: 'ana@test.cr',
    mensaje: 'Consulta de prueba', telefono: '',
    respuesta: '', estado: 'Pendiente',
    fechaEnvio: new Date().toISOString(), fechaRespuesta: null,
    update: jest.fn().mockImplementation(function(data) { Object.assign(this, data); return Promise.resolve(this); }),
    destroy: jest.fn().mockResolvedValue(),
    toJSON() { return { id: this.id, nombre: this.nombre, correo: this.correo, mensaje: this.mensaje, respuesta: this.respuesta, estado: this.estado }; },
    ...overrides,
  });

  const mockSolicitud = (overrides = {}) => ({
    id: 1, usuarioId: 4, nombreDelPuesto: 'Mi Puesto',
    correoUsuario: 'luis@test.cr', rolSolicitado: 'Productor', estado: 'Pendiente',
    motivoRespuesta: '', fechaSolicitud: new Date().toISOString(),
    update: jest.fn().mockImplementation(function(data) { Object.assign(this, data); return Promise.resolve(this); }),
    destroy: jest.fn().mockResolvedValue(),
    toJSON() { return { id: this.id, usuarioId: this.usuarioId, nombreDelPuesto: this.nombreDelPuesto, estado: this.estado }; },
    ...overrides,
  });

  return {
    sequelize: {
      authenticate: jest.fn().mockResolvedValue(),
      sync: jest.fn().mockResolvedValue(),
      // approve() en solicitudCambioRolService usa una transacción explícita
      // para cambiar rol + crear PuestoProductor + crear PuestoFeria + cerrar
      // la solicitud atómicamente. El mock ejecuta el callback con un objeto
      // dummy como transacción.
      transaction: jest.fn().mockImplementation(async (cb) => cb({})),
    },
    MensajeContacto: {
      findAll:  jest.fn(),
      findByPk: jest.fn(),
      create:   jest.fn(),
      _mock: mockMsg,
    },
    SolicitudCambioRol: {
      findAll:  jest.fn(),
      findByPk: jest.fn(),
      findOne:  jest.fn().mockResolvedValue(null),
      create:   jest.fn(),
      _mock: mockSolicitud,
    },
    Usuario: {
      update: jest.fn().mockResolvedValue([1]),
    },
    Role: {
      findOne: jest.fn().mockResolvedValue({ id: 2, nombre: 'Productor' }),
    },
    // Mocks añadidos por la implementación de 3b (autorización por feria):
    // approve() crea el puesto y la fila puesto_ferias del productor recién aprobado.
    PuestoProductor: {
      findOrCreate: jest.fn().mockResolvedValue([{ id: 1, feria_id: 1 }, true]),
    },
    PuestoFeria: {
      findOrCreate: jest.fn().mockResolvedValue([{ id: 1, puesto_id: 1, feria_id: 1 }, true]),
    },
    DeliveryDriver: {
      findOrCreate: jest.fn().mockResolvedValue([{ id: 1 }, true]),
    },
  };
});

const request = require('supertest');
const jwt     = require('jsonwebtoken');
const app     = require('../app');
const { MensajeContacto, SolicitudCambioRol } = require('../models');

const adminToken = () =>
  jwt.sign({ id: 99, email: 'a@a.cr', role: 'Administrador' }, process.env.JWT_SECRET, { expiresIn: '1h' });
const authH = () => ({ Authorization: `Bearer ${adminToken()}` });

// ═════════════════════════════════════════════════════════════════════════════
// ContactMessages
// ═════════════════════════════════════════════════════════════════════════════
describe('POST /contactMessages (público)', () => {
  beforeEach(() => jest.clearAllMocks());

  test('201 - cualquiera puede enviar mensaje sin token', async () => {
    MensajeContacto.create.mockResolvedValue(MensajeContacto._mock({ id: 3 }));
    const res = await request(app)
      .post('/mensajes')
      .send({ nombre: 'Juan', correo: 'juan@test.cr', mensaje: 'Hola, necesito info.' });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.estado).toBe('Pendiente');
  });

  test('400 - mensaje vacío', async () => {
    const res = await request(app)
      .post('/mensajes')
      .send({ nombre: 'Juan', correo: 'juan@test.cr' }); // sin mensaje
    expect(res.status).toBe(400);
  });
});

describe('GET /mensajes (protegido)', () => {
  beforeEach(() => jest.clearAllMocks());

  test('401 - sin token no puede leer mensajes', async () => {
    const res = await request(app).get('/mensajes');
    expect(res.status).toBe(401);
  });

  test('200 - admin puede listar todos los mensajes', async () => {
    MensajeContacto.findAll.mockResolvedValue([
      MensajeContacto._mock({ id: 1 }),
      MensajeContacto._mock({ id: 2, nombre: 'Pedro' }),
    ]);
    const res = await request(app).get('/mensajes').set(authH());
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });
});

describe('PATCH /mensajes/:id (responder)', () => {
  beforeEach(() => jest.clearAllMocks());

  test('200 - admin responde y cambia estado a Respondido', async () => {
    const msg = MensajeContacto._mock({ id: 1 });
    MensajeContacto.findByPk.mockResolvedValue(msg);

    const res = await request(app)
      .patch('/mensajes/1')
      .set(authH())
      .send({ respuesta: 'Gracias por escribirnos.', estado: 'Respondido' });

    expect(res.status).toBe(200);
    expect(msg.update).toHaveBeenCalledWith(
      expect.objectContaining({ estado: 'Respondido' })
    );
  });

  test('404 - mensaje no encontrado', async () => {
    MensajeContacto.findByPk.mockResolvedValue(null);
    const res = await request(app).patch('/mensajes/999').set(authH()).send({});
    expect(res.status).toBe(404);
  });

  test('401 - sin token no puede responder', async () => {
    const res = await request(app).patch('/mensajes/1').send({ respuesta: 'Hola' });
    expect(res.status).toBe(401);
  });
});

describe('DELETE /mensajes/:id', () => {
  beforeEach(() => jest.clearAllMocks());

  test('200 - admin elimina mensaje', async () => {
    const msg = MensajeContacto._mock({ id: 2 });
    MensajeContacto.findByPk.mockResolvedValue(msg);
    const res = await request(app).delete('/mensajes/2').set(authH());
    expect(res.status).toBe(200);
    expect(msg.destroy).toHaveBeenCalled();
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// SolicitudesCambioRol
// ═════════════════════════════════════════════════════════════════════════════
describe('POST /solicitudes', () => {
  beforeEach(() => jest.clearAllMocks());

  const userToken = () =>
    jwt.sign({ id: 4, email: 'luis@test.cr', role: 'Usuario' }, process.env.JWT_SECRET, { expiresIn: '1h' });

  test('201 - usuario autenticado puede enviar solicitud', async () => {
    SolicitudCambioRol.create.mockResolvedValue(SolicitudCambioRol._mock({ id: 1 }));

    const res = await request(app)
      .post('/solicitudes')
      .set('Authorization', `Bearer ${userToken()}`)
      .send({
        usuarioId: 4, nombreDelPuesto: 'Mi Puesto Orgánico',
        rolSolicitado: 'Productor',
        correoUsuario: 'luis@test.cr', estado: 'Pendiente',
        fechaSolicitud: new Date().toISOString(),
      });

    expect(res.status).toBe(201);
    expect(res.body.estado).toBe('Pendiente');
  });

  test('401 - sin token no puede solicitar', async () => {
    const res = await request(app).post('/solicitudes').send({ usuarioId: 1 });
    expect(res.status).toBe(401);
  });
});

// Los endpoints dedicados `/aprobar` y `/rechazar` son los únicos que pueden
// cambiar el estado. El PATCH genérico /solicitudes/:id bloquea cambios de estado
// para evitar auto-aprobación por usuarios no-admin.
describe('PATCH /solicitudes/:id/aprobar', () => {
  beforeEach(() => jest.clearAllMocks());

  test('200 - admin aprueba solicitud y rol del usuario se actualiza', async () => {
    const sol = SolicitudCambioRol._mock({ id: 1, rolSolicitado: 'Productor', usuarioId: 4 });
    SolicitudCambioRol.findByPk.mockResolvedValue(sol);

    const res = await request(app)
      .patch('/solicitudes/1/aprobar')
      .set(authH())
      .send({ motivoRespuesta: 'Cumple los requisitos.' });

    expect(res.status).toBe(200);
    // approve() ahora envuelve la mutación en una transacción, así que update
    // recibe (data, { transaction }). Validamos solo los campos de negocio.
    expect(sol.update).toHaveBeenCalledWith(
      expect.objectContaining({ estado: 'Aprobada' }),
      expect.objectContaining({ transaction: expect.anything() })
    );
  });

  test('200 - aprobar Productor crea PuestoProductor y PuestoFeria en transacción', async () => {
    // El mock de SolicitudCambioRol expone propiedades camelCase, pero approve()
    // lee snake_case (rol_solicitado, usuario_id), por lo que el bloque
    // Productor SOLO se dispara si la solicitud trae esas claves.
    const sol = SolicitudCambioRol._mock({
      id: 7,
      rol_solicitado: 'Productor',
      usuario_id: 4,
      nombre_del_puesto: 'Puesto Lechuga',
      // approve() llama solicitud.usuario.update(...) cuando hay role válido,
      // así que el usuario embebido debe exponer update como jest.fn().
      usuario: { name: 'Luis', feriaId: 2, update: jest.fn().mockResolvedValue() },
    });
    SolicitudCambioRol.findByPk.mockResolvedValue(sol);

    const { PuestoProductor, PuestoFeria } = require('../models');

    const res = await request(app)
      .patch('/solicitudes/7/aprobar')
      .set(authH())
      .send({ motivoRespuesta: 'OK' });

    expect(res.status).toBe(200);
    expect(PuestoProductor.findOrCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { usuario_id: 4 },
        defaults: expect.objectContaining({ usuario_id: 4, feria_id: 2 }),
      })
    );
    // PuestoFeria sólo se crea si el puesto trae feria; el mock devuelve feria_id: 1
    // por defecto, así que findOrCreate debe haberse llamado para autorizar al
    // productor en su feria principal.
    expect(PuestoFeria.findOrCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ puesto_id: 1, feria_id: 1 }),
      })
    );
  });

  test('404 - solicitud no encontrada', async () => {
    SolicitudCambioRol.findByPk.mockResolvedValue(null);
    const res = await request(app).patch('/solicitudes/999/aprobar').set(authH()).send({});
    expect(res.status).toBe(404);
  });
});

describe('PATCH /solicitudes/:id/rechazar', () => {
  beforeEach(() => jest.clearAllMocks());

  test('200 - admin rechaza solicitud', async () => {
    const sol = SolicitudCambioRol._mock({ id: 2 });
    SolicitudCambioRol.findByPk.mockResolvedValue(sol);

    const res = await request(app)
      .patch('/solicitudes/2/rechazar')
      .set(authH())
      .send({ motivoRespuesta: 'Información incompleta.' });

    expect(res.status).toBe(200);
    expect(sol.update).toHaveBeenCalledWith(
      expect.objectContaining({ estado: 'Rechazada' })
    );
  });
});

describe('PATCH /solicitudes/:id (update genérico no cambia estado)', () => {
  beforeEach(() => jest.clearAllMocks());

  test('200 - el `estado` enviado se ignora (defensa contra auto-aprobación)', async () => {
    const sol = SolicitudCambioRol._mock({ id: 3, estado: 'Pendiente' });
    SolicitudCambioRol.findByPk.mockResolvedValue(sol);

    const res = await request(app)
      .patch('/solicitudes/3')
      .set(authH())
      .send({ estado: 'Aprobada', nombreDelPuesto: 'Nuevo nombre' });

    expect(res.status).toBe(200);
    // El estado NO debe llegar a `update`; pero `nombre_del_puesto` sí.
    const args = sol.update.mock.calls[0][0];
    expect(args).not.toHaveProperty('estado');
    expect(args).toHaveProperty('nombre_del_puesto', 'Nuevo nombre');
  });
});
