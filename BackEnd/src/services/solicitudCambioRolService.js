// ============================================================
// Service: SolicitudCambioRol
// Descripción: Lógica de negocio para solicitudes de cambio
//              de rol (flujo de aprobación admin)
// ============================================================
const { SolicitudCambioRol, Usuario } = require('../models');

const findAll = async (query = {}) => {
  const where = {};

  if (query.estado) {
    where.estado = query.estado;
  }

  return await SolicitudCambioRol.findAll({
    where,
    include: [{ model: Usuario, as: 'usuario', attributes: ['id', 'name', 'nombre', 'email', 'role'] }],
    order: [['fecha_solicitud', 'DESC']],
  });
};

const findById = async (id) => {
  return await SolicitudCambioRol.findByPk(id, {
    include: [{ model: Usuario, as: 'usuario', attributes: ['id', 'name', 'nombre', 'email', 'role'] }],
  });
};

const findByUsuario = async (usuarioId) => {
  return await SolicitudCambioRol.findAll({
    where: { usuario_id: usuarioId },
    order: [['fecha_solicitud', 'DESC']],
  });
};

const findPendientes = async () => {
  return await SolicitudCambioRol.findAll({
    where: { estado: 'Pendiente' },
    include: [{ model: Usuario, as: 'usuario', attributes: ['id', 'name', 'nombre', 'email', 'role'] }],
    order: [['fecha_solicitud', 'ASC']],
  });
};

const create = async (data) => {
  const usuario_id = data.usuario_id || data.usuarioId;
  const rol_solicitado = data.rol_solicitado || data.rolSolicitado;
  const nombre_del_puesto = data.nombre_del_puesto || data.nombreDelPuesto;
  const correo_usuario = data.correo_usuario || data.correoUsuario;
  const nombre_usuario = data.nombre_usuario || data.nombreUsuario;

  if (!usuario_id) {
    throw new Error('El ID del usuario es requerido');
  }
  if (!rol_solicitado) {
    throw new Error('El rol solicitado es requerido');
  }

  // Verificar que no tenga una solicitud pendiente
  const pendiente = await SolicitudCambioRol.findOne({
    where: { usuario_id, estado: 'Pendiente' },
  });
  if (pendiente) {
    throw new Error('Ya existe una solicitud pendiente para este usuario');
  }

  return await SolicitudCambioRol.create({
    ...data,
    usuario_id,
    rol_solicitado,
    nombre_del_puesto,
    correo_usuario,
    nombre_usuario,
    estado: 'Pendiente',
    fecha_solicitud: new Date(),
  });
};

const update = async (id, data) => {
  const solicitud = await SolicitudCambioRol.findByPk(id);
  if (!solicitud) {
    throw new Error('Solicitud no encontrada');
  }

  const updateData = { ...data };
  
  if (data.nombreUsuario !== undefined) updateData.nombre_usuario = data.nombreUsuario;
  if (data.nombreDelPuesto !== undefined) updateData.nombre_del_puesto = data.nombreDelPuesto;
  if (data.correoUsuario !== undefined) updateData.correo_usuario = data.correoUsuario;
  if (data.rolSolicitado !== undefined) updateData.rol_solicitado = data.rolSolicitado;

  return await solicitud.update(updateData);
};

const approve = async (id, data = {}) => {
  const solicitud = await SolicitudCambioRol.findByPk(id, {
    include: [{ model: Usuario, as: 'usuario' }],
  });
  if (!solicitud) {
    throw new Error('Solicitud no encontrada');
  }
  if (solicitud.estado !== 'Pendiente') {
    throw new Error('Solo se pueden aprobar solicitudes pendientes');
  }

  // Actualizar el rol del usuario
  await solicitud.usuario.update({ role: solicitud.rol_solicitado });

  // Actualizar la solicitud
  await solicitud.update({
    estado: 'Aprobada',
    motivo_respuesta: data.motivo_respuesta || 'Solicitud aprobada',
    fecha_respuesta: new Date(),
  });

  return solicitud;
};

const reject = async (id, data = {}) => {
  const solicitud = await SolicitudCambioRol.findByPk(id);
  if (!solicitud) {
    throw new Error('Solicitud no encontrada');
  }
  if (solicitud.estado !== 'Pendiente') {
    throw new Error('Solo se pueden rechazar solicitudes pendientes');
  }

  await solicitud.update({
    estado: 'Rechazada',
    motivo_respuesta: data.motivo_respuesta || 'Solicitud rechazada',
    fecha_respuesta: new Date(),
  });

  return solicitud;
};

const remove = async (id) => {
  const solicitud = await SolicitudCambioRol.findByPk(id);
  if (!solicitud) {
    throw new Error('Solicitud no encontrada');
  }
  await solicitud.destroy();
  return true;
};

module.exports = {
  findAll,
  findById,
  findByUsuario,
  findPendientes,
  create,
  update,
  approve,
  reject,
  remove,
};
