// ============================================================
// Service: MensajeContacto
// Descripción: Lógica de negocio para mensajes del formulario
//              de contacto público
// ============================================================
const { MensajeContacto } = require('../models');

const findAll = async (query = {}) => {
  const where = {};

  if (query.estado) {
    where.estado = query.estado;
  }

  return await MensajeContacto.findAll({
    where,
    order: [['fecha_envio', 'DESC']],
  });
};

const findById = async (id) => {
  return await MensajeContacto.findByPk(id);
};

const findPendientes = async () => {
  return await MensajeContacto.findAll({
    where: { estado: 'Pendiente' },
    order: [['fecha_envio', 'ASC']],
  });
};

const create = async (data) => {
  if (!data.nombre) {
    throw new Error('El nombre es requerido');
  }
  if (!data.correo) {
    throw new Error('El correo es requerido');
  }
  if (!data.mensaje) {
    throw new Error('El mensaje es requerido');
  }

  return await MensajeContacto.create({
    ...data,
    estado: 'Pendiente',
    fecha_envio: new Date(),
  });
};

const reply = async (id, data) => {
  const mensaje = await MensajeContacto.findByPk(id);
  if (!mensaje) {
    throw new Error('Mensaje no encontrado');
  }

  if (!data.respuesta) {
    throw new Error('La respuesta es requerida');
  }

  await mensaje.update({
    respuesta: data.respuesta,
    fecha_respuesta: new Date(),
    estado: 'Respondido',
  });

  return mensaje;
};

const remove = async (id) => {
  const mensaje = await MensajeContacto.findByPk(id);
  if (!mensaje) {
    throw new Error('Mensaje no encontrado');
  }
  await mensaje.destroy();
  return true;
};

module.exports = { findAll, findById, findPendientes, create, reply, remove };
