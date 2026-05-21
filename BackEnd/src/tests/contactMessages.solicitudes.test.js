'use strict';
require('./setup');

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
    correoUsuario: 'luis@test.cr', rolSolicitado: 'Agricultor', estado: 'Pendiente',
    motivoRespuesta: '', fechaSolicitud: new Date().toISOString(),
    update: jest.fn().mockImplementation(function(data) { Object.assign(this, data); return Promise.resolve(this); }),
    destroy: jest.fn().mockResolvedValue(),
    toJSON() { return { id: this.id, usuarioId: this.usuarioId, nombreDelPuesto: this.nombreDelPuesto, estado: this.estado }; },
    ...overrides,
  });

  return {
    sequelize: { authenticate: jest.fn().mockResolvedValue(), sync: jest.fn().mockResolvedValue() },
    ContactMessage: {
      findAll:  jest.fn(),
      findByPk: jest.fn(),
      create:   jest.fn(),
      _mock: mockMsg,
    },
    SolicitudCambioRol: {
      findAll:  jest.fn(),
      findByPk: jest.fn(),
      create:   jest.fn(),
      _mock: mockSolicitud,
    },
    Usuario: {
      update: jest.fn().mockResolvedValue([1]),
    },
  };
});

const request = require('supertest');
const jwt     = require('jsonwebtoken');
const app     = require('../app');
const { ContactMessage, SolicitudCambioRol } = require('../models');

const adminToken = () =>
  jwt.sign({ id: 99, email: 'a@a.cr', role: 'Administrador' }, process.env.JWT_SECRET, { expiresIn: '1h' });
const authH = () => ({ Authorization: `Bearer ${adminToken()}` });

// ═════════════════════════════════════════════════════════════════════════════
// ContactMessages
// ═════════════════════════════════════════════════════════════════════════════
describe('POST /contactMessages (público)', () => {
  beforeEach(() => jest.clearAllMocks());

  test('201 - cualquiera puede enviar mensaje sin token', async () => {
    ContactMessage.create.mockResolvedValue(ContactMessage._mock({ id: 3 }));
    const res = await request(app)
      .post('/contactMessages')
      .send({ nombre: 'Juan', correo: 'juan@test.cr', mensaje: 'Hola, necesito info.' });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.estado).toBe('Pendiente');
  });

  test('400 - mensaje vacío', async () => {
    const res = await request(app)
      .post('/contactMessages')
      .send({ nombre: 'Juan', correo: 'juan@test.cr' }); // sin mensaje
    expect(res.status).toBe(400);
  });

  test('400 - correo inválido', async () => {
    const res = await request(app)
      .post('/contactMessages')
      .send({ nombre: 'Juan', correo: 'no-es-un-email', mensaje: 'Hola' });
    expect(res.status).toBe(400);
  });
});

describe('GET /contactMessages (protegido)', () => {
  beforeEach(() => jest.clearAllMocks());

  test('401 - sin token no puede leer mensajes', async () => {
    const res = await request(app).get('/contactMessages');
    expect(res.status).toBe(401);
  });

  test('200 - admin puede listar todos los mensajes', async () => {
    ContactMessage.findAll.mockResolvedValue([
      ContactMessage._mock({ id: 1 }),
      ContactMessage._mock({ id: 2, nombre: 'Pedro' }),
    ]);
    const res = await request(app).get('/contactMessages').set(authH());
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });
});

describe('PATCH /contactMessages/:id (responder)', () => {
  beforeEach(() => jest.clearAllMocks());

  test('200 - admin responde y cambia estado a Respondido', async () => {
    const msg = ContactMessage._mock({ id: 1 });
    ContactMessage.findByPk.mockResolvedValue(msg);

    const res = await request(app)
      .patch('/contactMessages/1')
      .set(authH())
      .send({ respuesta: 'Gracias por escribirnos.', estado: 'Respondido' });

    expect(res.status).toBe(200);
    expect(msg.update).toHaveBeenCalledWith(
      expect.objectContaining({ estado: 'Respondido' })
    );
  });

  test('404 - mensaje no encontrado', async () => {
    ContactMessage.findByPk.mockResolvedValue(null);
    const res = await request(app).patch('/contactMessages/999').set(authH()).send({});
    expect(res.status).toBe(404);
  });

  test('401 - sin token no puede responder', async () => {
    const res = await request(app).patch('/contactMessages/1').send({ respuesta: 'Hola' });
    expect(res.status).toBe(401);
  });
});

describe('DELETE /contactMessages/:id', () => {
  beforeEach(() => jest.clearAllMocks());

  test('200 - admin elimina mensaje', async () => {
    const msg = ContactMessage._mock({ id: 2 });
    ContactMessage.findByPk.mockResolvedValue(msg);
    const res = await request(app).delete('/contactMessages/2').set(authH());
    expect(res.status).toBe(200);
    expect(msg.destroy).toHaveBeenCalled();
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// SolicitudesCambioRol
// ═════════════════════════════════════════════════════════════════════════════
describe('POST /solicitudesCambioRol', () => {
  beforeEach(() => jest.clearAllMocks());

  const userToken = () =>
    jwt.sign({ id: 4, email: 'luis@test.cr', role: 'Usuario' }, process.env.JWT_SECRET, { expiresIn: '1h' });

  test('201 - usuario autenticado puede enviar solicitud', async () => {
    SolicitudCambioRol.create.mockResolvedValue(SolicitudCambioRol._mock({ id: 1 }));

    const res = await request(app)
      .post('/solicitudesCambioRol')
      .set('Authorization', `Bearer ${userToken()}`)
      .send({
        usuarioId: 4, nombreDelPuesto: 'Mi Puesto Orgánico',
        correoUsuario: 'luis@test.cr', estado: 'Pendiente',
        fechaSolicitud: new Date().toISOString(),
      });

    expect(res.status).toBe(201);
    expect(res.body.estado).toBe('Pendiente');
  });

  test('401 - sin token no puede solicitar', async () => {
    const res = await request(app).post('/solicitudesCambioRol').send({ usuarioId: 1 });
    expect(res.status).toBe(401);
  });
});

describe('PATCH /solicitudesCambioRol/:id (aprobar/rechazar)', () => {
  beforeEach(() => jest.clearAllMocks());

  test('200 - admin aprueba solicitud y rol del usuario se actualiza', async () => {
    const sol = SolicitudCambioRol._mock({ id: 1, rolSolicitado: 'Agricultor', usuarioId: 4 });
    SolicitudCambioRol.findByPk.mockResolvedValue(sol);

    const res = await request(app)
      .patch('/solicitudesCambioRol/1')
      .set(authH())
      .send({ estado: 'Aprobada', motivoRespuesta: 'Cumple los requisitos.' });

    expect(res.status).toBe(200);
    expect(sol.update).toHaveBeenCalledWith(
      expect.objectContaining({ estado: 'Aprobada' })
    );
  });

  test('200 - admin rechaza solicitud', async () => {
    const sol = SolicitudCambioRol._mock({ id: 2 });
    SolicitudCambioRol.findByPk.mockResolvedValue(sol);

    const res = await request(app)
      .patch('/solicitudesCambioRol/2')
      .set(authH())
      .send({ estado: 'Rechazada', motivoRespuesta: 'Información incompleta.' });

    expect(res.status).toBe(200);
    expect(sol.update).toHaveBeenCalledWith(
      expect.objectContaining({ estado: 'Rechazada' })
    );
  });

  test('404 - solicitud no encontrada', async () => {
    SolicitudCambioRol.findByPk.mockResolvedValue(null);
    const res = await request(app).patch('/solicitudesCambioRol/999').set(authH()).send({});
    expect(res.status).toBe(404);
  });
});
