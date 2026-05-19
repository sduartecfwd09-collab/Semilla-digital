// ============================================================
// Service: SolicitudCambioRol
// Descripción: Lógica de negocio para solicitudes de cambio
//              de rol (flujo de aprobación admin)
// ============================================================
const { SolicitudCambioRol, Usuario, DeliveryDriver } = require('../models');

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
  if (!data.usuario_id) {
    throw new Error('El ID del usuario es requerido');
  }
  if (!data.rol_solicitado) {
    throw new Error('El rol solicitado es requerido');
  }

  // Verificar que no tenga una solicitud pendiente
  const pendiente = await SolicitudCambioRol.findOne({
    where: { usuario_id: data.usuario_id, estado: 'Pendiente' },
  });
  if (pendiente) {
    throw new Error('Ya existe una solicitud pendiente para este usuario');
  }

  return await SolicitudCambioRol.create({
    ...data,
    estado: 'Pendiente',
    fecha_solicitud: new Date(),
  });
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

  // Si el rol solicitado es DRIVER, creamos el repartidor correspondiente
  if (solicitud.rol_solicitado === 'DRIVER') {
    await DeliveryDriver.findOrCreate({
      where: { usuario_id: solicitud.usuario_id },
      defaults: {
        vehicle_type: solicitud.vehicle_type,
        license_plate: solicitud.license_plate,
        status: 'inactive',
      }
    });
  }

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

const update = async (id, data) => {
  const solicitud = await SolicitudCambioRol.findByPk(id);
  if (!solicitud) {
    throw new Error('Solicitud no encontrada');
  }
  return await solicitud.update(data);
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
  approve,
  reject,
  update,
  remove,
};
