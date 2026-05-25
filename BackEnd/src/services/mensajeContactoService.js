// ============================================================
// Service: MensajeContacto
// Descripción: Lógica de negocio para mensajes del formulario
//              de contacto público
// ============================================================
const { MensajeContacto } = require('../models');

const mapMensajeParaFrontend = (m) => {
  if (!m) return null;
  const raw = m.toJSON ? m.toJSON() : m;
  return {
    id: raw.id,
    nombre: raw.nombre,
    correo: raw.correo,
    telefono: raw.telefono,
    mensaje: raw.mensaje,
    respuesta: raw.respuesta,
    estado: raw.estado,
    fechaEnvio: raw.fecha_envio,
    fechaRespuesta: raw.fecha_respuesta,
    createdAt: raw.createdAt || raw.created_at,
    updatedAt: raw.updatedAt || raw.updated_at,
  };
};

const findAll = async (query = {}) => {
  const where = {};

  if (query.estado) {
    where.estado = query.estado;
  }

  const list = await MensajeContacto.findAll({
    where,
    order: [['fecha_envio', 'DESC']],
  });
  return list.map(mapMensajeParaFrontend);
};

const findById = async (id) => {
  const item = await MensajeContacto.findByPk(id);
  return mapMensajeParaFrontend(item);
};

const findPendientes = async () => {
  const list = await MensajeContacto.findAll({
    where: { estado: 'Pendiente' },
    order: [['fecha_envio', 'ASC']],
  });
  return list.map(mapMensajeParaFrontend);
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

  const created = await MensajeContacto.create({
    ...data,
    estado: 'Pendiente',
    fecha_envio: new Date(),
  });
  return mapMensajeParaFrontend(created);
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

  return mapMensajeParaFrontend(mensaje);
};

const update = async (id, data) => {
  const mensaje = await MensajeContacto.findByPk(id);
  if (!mensaje) {
    throw new Error('Mensaje no encontrado');
  }

  // Mapear campos camelCase del frontend a snake_case del modelo
  const updateData = { ...data };
  if (data.fechaRespuesta !== undefined) updateData.fecha_respuesta = data.fechaRespuesta;
  if (data.fechaEnvio !== undefined) updateData.fecha_envio = data.fechaEnvio;

  // Si vienen `respuesta` + `estado: 'Respondido'`, equivale a un reply (cualquier mensaje puede responderse,
  // incluso si estaba ya respondido — el admin podría editar su respuesta).
  if (data.respuesta && data.estado === 'Respondido') {
    if (!updateData.fecha_respuesta) updateData.fecha_respuesta = new Date();
    const updated = await mensaje.update(updateData);
    return mapMensajeParaFrontend(updated);
  }

  // Edición normal: solo permitida si el mensaje aún está pendiente
  if (mensaje.estado === 'Respondido') {
    throw new Error('No se puede editar un mensaje ya respondido');
  }
  const updated = await mensaje.update(updateData);
  return mapMensajeParaFrontend(updated);
};

const remove = async (id) => {
  const mensaje = await MensajeContacto.findByPk(id);
  if (!mensaje) {
    throw new Error('Mensaje no encontrado');
  }
  await mensaje.destroy();
  return true;
};

module.exports = { findAll, findById, findPendientes, create, reply, update, remove };
