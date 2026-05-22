const { SolicitudCambioRol, Usuario, Role } = require('../models');

const mapSolicitudParaFrontend = (s) => {
  if (!s) return null;
  const raw = s.toJSON ? s.toJSON() : s;
  return {
    id: raw.id,
    usuarioId: raw.usuario_id,
    nombreUsuario: raw.nombre_usuario,
    nombreDelPuesto: raw.nombre_del_puesto,
    correoUsuario: raw.correo_usuario,
    rolSolicitado: raw.rol_solicitado,
    estado: raw.estado,
    fechaSolicitud: raw.fecha_solicitud,
    motivoRespuesta: raw.motivo_respuesta,
    fechaRespuesta: raw.fecha_respuesta,
    createdAt: raw.createdAt || raw.created_at,
    updatedAt: raw.updatedAt || raw.updated_at,
    usuario: raw.usuario ? {
      id: raw.usuario.id,
      name: raw.usuario.name,
      nombre: raw.usuario.nombre,
      email: raw.usuario.email,
      role: raw.usuario.role || (raw.usuario.rol ? raw.usuario.rol.nombre : 'Usuario')
    } : null
  };
};

const findAll = async (query = {}) => {
  const where = {};

  if (query.estado) {
    where.estado = query.estado;
  }

  const list = await SolicitudCambioRol.findAll({
    where,
    include: [{ model: Usuario, as: 'usuario', attributes: ['id', 'name', 'nombre', 'email', 'roleId'] }],
    order: [['fecha_solicitud', 'DESC']],
  });
  return list.map(mapSolicitudParaFrontend);
};

const findById = async (id) => {
  const item = await SolicitudCambioRol.findByPk(id, {
    include: [{ model: Usuario, as: 'usuario', attributes: ['id', 'name', 'nombre', 'email', 'roleId'] }],
  });
  return mapSolicitudParaFrontend(item);
};

const findByUsuario = async (usuarioId) => {
  const list = await SolicitudCambioRol.findAll({
    where: { usuario_id: usuarioId },
    order: [['fecha_solicitud', 'DESC']],
  });
  return list.map(mapSolicitudParaFrontend);
};

const findPendientes = async () => {
  const list = await SolicitudCambioRol.findAll({
    where: { estado: 'Pendiente' },
    include: [{ model: Usuario, as: 'usuario', attributes: ['id', 'name', 'nombre', 'email', 'roleId'] }],
    order: [['fecha_solicitud', 'ASC']],
  });
  return list.map(mapSolicitudParaFrontend);
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

  const created = await SolicitudCambioRol.create({
    ...data,
    usuario_id,
    rol_solicitado,
    nombre_del_puesto,
    correo_usuario,
    nombre_usuario,
    estado: 'Pendiente',
    fecha_solicitud: new Date(),
  });
  return mapSolicitudParaFrontend(created);
};

const update = async (id, data) => {
  const solicitud = await SolicitudCambioRol.findByPk(id);
  if (!solicitud) {
    throw new Error('Solicitud no encontrada');
  }

  // El cambio de estado SOLO se permite vía los endpoints dedicados (approve/reject),
  // que están protegidos por rol Administrador en la capa de rutas. Aquí lo bloqueamos
  // explícitamente para evitar que un usuario común se auto-apruebe enviando
  // `estado: 'Aprobada'` por PATCH /solicitudes/:id.
  const updateData = { ...data };
  delete updateData.estado;
  delete updateData.motivoRespuesta;
  delete updateData.motivo_respuesta;
  delete updateData.fechaRespuesta;
  delete updateData.fecha_respuesta;

  if (data.nombreUsuario !== undefined) updateData.nombre_usuario = data.nombreUsuario;
  if (data.nombreDelPuesto !== undefined) updateData.nombre_del_puesto = data.nombreDelPuesto;
  if (data.correoUsuario !== undefined) updateData.correo_usuario = data.correoUsuario;
  if (data.rolSolicitado !== undefined) updateData.rol_solicitado = data.rolSolicitado;

  const updated = await solicitud.update(updateData);
  return mapSolicitudParaFrontend(updated);
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

  // Actualizar el rol del usuario utilizando roleId (RBAC) de forma segura
  // Mapeo de roles legacy a roles actuales
  const legacyMapping = { 'Vendedor': 'Productor', 'Agricultor': 'Productor' };
  const targetRoleName = legacyMapping[solicitud.rol_solicitado] || solicitud.rol_solicitado;
  const role = await Role.findOne({ where: { nombre: targetRoleName } });
  if (role && solicitud.usuario) {
    await solicitud.usuario.update({ roleId: role.id });
  }

  // Actualizar la solicitud
  const approved = await solicitud.update({
    estado: 'Aprobada',
    motivo_respuesta: data.motivo_respuesta || 'Solicitud aprobada',
    fecha_respuesta: new Date(),
  });

  return mapSolicitudParaFrontend(approved);
};

const reject = async (id, data = {}) => {
  const solicitud = await SolicitudCambioRol.findByPk(id);
  if (!solicitud) {
    throw new Error('Solicitud no encontrada');
  }
  if (solicitud.estado !== 'Pendiente') {
    throw new Error('Solo se pueden rechazar solicitudes pendientes');
  }

  const rejected = await solicitud.update({
    estado: 'Rechazada',
    motivo_respuesta: data.motivo_respuesta || 'Solicitud rechazada',
    fecha_respuesta: new Date(),
  });

  return mapSolicitudParaFrontend(rejected);
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
