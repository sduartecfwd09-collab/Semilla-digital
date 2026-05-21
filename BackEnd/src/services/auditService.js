// ============================================================
// Service: AuditLog
// Descripción: Registra acciones sensibles del sistema
//              Inmutable — solo inserta, nunca edita ni elimina
// ============================================================
'use strict';
const { AuditLog, Usuario } = require('../models');

/**
 * Registra una acción en el log de auditoría
 * @param {Object} params
 * @param {number|null} params.usuarioId - ID del usuario que realizó la acción
 * @param {string} params.accion - CREAR, EDITAR, ELIMINAR, LOGIN, CAMBIO_ROL, etc.
 * @param {string} params.recurso - Tabla/entidad afectada
 * @param {number|null} params.recursoId - ID del recurso afectado
 * @param {Object|null} params.detalles - Datos antes/después del cambio
 * @param {Object|null} params.req - Express request object (para IP y user-agent)
 */
const registrar = async ({ usuarioId = null, accion, recurso, recursoId = null, detalles = null, req = null }) => {
  try {
    await AuditLog.create({
      usuario_id: usuarioId,
      accion,
      recurso,
      recurso_id: recursoId,
      detalles,
      ip: req ? (req.headers['x-forwarded-for'] || req.connection?.remoteAddress || null) : null,
      user_agent: req ? req.headers['user-agent'] || null : null,
    });
  } catch (error) {
    // El logging de auditoría NUNCA debe crashear la app
    console.error('⚠️ Error registrando audit log:', error.message);
  }
};

/**
 * Consulta logs de auditoría con filtros y paginación
 */
const consultar = async ({ usuarioId, accion, recurso, desde, hasta, page = 1, limit = 50 }) => {
  const where = {};

  if (usuarioId) where.usuario_id = usuarioId;
  if (accion) where.accion = accion;
  if (recurso) where.recurso = recurso;

  if (desde || hasta) {
    const { Op } = require('sequelize');
    where.created_at = {};
    if (desde) where.created_at[Op.gte] = new Date(desde);
    if (hasta) where.created_at[Op.lte] = new Date(hasta);
  }

  const offset = (page - 1) * limit;

  const { count, rows } = await AuditLog.findAndCountAll({
    where,
    include: [{
      model: Usuario,
      as: 'usuario',
      attributes: ['id', 'name', 'email'],
    }],
    order: [['created_at', 'DESC']],
    limit,
    offset,
  });

  return {
    data: rows,
    pagination: {
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    },
  };
};

module.exports = {
  registrar,
  consultar,
};
