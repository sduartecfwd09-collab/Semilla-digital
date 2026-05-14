'use strict';
const { SolicitudCambioRol, Usuario, PuestoAgricultor } = require('../models');

const formatValidationErrors = (error) => {
  if (error.name === 'SequelizeValidationError') {
    return error.errors.map((e) => e.message).join(' | ');
  }
  return error.message;
};

// GET /solicitudesCambioRol
const getAll = async (req, res) => {
  try {
    const solicitudes = await SolicitudCambioRol.findAll({
      order: [['fechaSolicitud', 'DESC']],
    });
    return res.json(solicitudes);
  } catch (error) {
    console.error('[SolicitudCambioRol] getAll:', error);
    return res.status(500).json({ error: 'Error al obtener las solicitudes.' });
  }
};

// GET /solicitudesCambioRol/:id
const getById = async (req, res) => {
  try {
    const sol = await SolicitudCambioRol.findByPk(req.params.id);
    if (!sol) return res.status(404).json({ error: 'Solicitud no encontrada.' });
    return res.json(sol);
  } catch (error) {
    console.error('[SolicitudCambioRol] getById:', error);
    return res.status(500).json({ error: 'Error al obtener la solicitud.' });
  }
};

// POST /solicitudesCambioRol
const create = async (req, res) => {
  try {
    const {
      usuarioId, nombreDelPuesto, correoUsuario,
      rolSolicitado, estado, motivoRespuesta, fechaSolicitud,
    } = req.body;

    if (!usuarioId || !nombreDelPuesto || !correoUsuario) {
      return res.status(400).json({
        error: 'Los campos usuarioId, nombreDelPuesto y correoUsuario son obligatorios.',
      });
    }

    const solicitud = await SolicitudCambioRol.create({
      usuarioId,
      nombreDelPuesto: nombreDelPuesto.trim(),
      correoUsuario: correoUsuario.trim(),
      rolSolicitado: rolSolicitado || 'Agricultor',
      estado: estado || 'Pendiente',
      motivoRespuesta: motivoRespuesta || '',
      fechaSolicitud: fechaSolicitud || new Date(),
    });

    return res.status(201).json(solicitud);
  } catch (error) {
    console.error('[SolicitudCambioRol] create:', error);
    return res.status(400).json({ error: formatValidationErrors(error) });
  }
};

// PATCH /solicitudesCambioRol/:id
// Usado para: actualizar estado (Aprobada/Rechazada) y también para editar datos pendientes
const patch = async (req, res) => {
  try {
    const sol = await SolicitudCambioRol.findByPk(req.params.id);
    if (!sol) return res.status(404).json({ error: 'Solicitud no encontrada.' });

    const { estado, motivoRespuesta, fechaRespuesta, nombreDelPuesto, correoUsuario } = req.body;

    await sol.update({
      estado: estado || sol.estado,
      motivoRespuesta: motivoRespuesta !== undefined ? motivoRespuesta : sol.motivoRespuesta,
      fechaRespuesta: fechaRespuesta || (estado && estado !== 'Pendiente' ? new Date() : sol.fechaRespuesta),
      nombreDelPuesto: nombreDelPuesto ? nombreDelPuesto.trim() : sol.nombreDelPuesto,
      correoUsuario: correoUsuario ? correoUsuario.trim() : sol.correoUsuario,
    });

    // Si se aprueba, actualizar el rol del usuario automáticamente
    if (estado === 'Aprobada' && sol.usuarioId) {
      try {
        await Usuario.update(
          { role: sol.rolSolicitado || 'Agricultor' },
          { where: { id: sol.usuarioId } }
        );
      } catch (e) {
        console.warn('[SolicitudCambioRol] No se pudo actualizar el rol del usuario:', e.message);
      }
    }

    return res.json(sol);
  } catch (error) {
    console.error('[SolicitudCambioRol] patch:', error);
    return res.status(400).json({ error: formatValidationErrors(error) });
  }
};

// DELETE /solicitudesCambioRol/:id
const remove = async (req, res) => {
  try {
    const sol = await SolicitudCambioRol.findByPk(req.params.id);
    if (!sol) return res.status(404).json({ error: 'Solicitud no encontrada.' });
    await sol.destroy();
    return res.json({ message: 'Solicitud eliminada correctamente.' });
  } catch (error) {
    console.error('[SolicitudCambioRol] remove:', error);
    return res.status(500).json({ error: 'Error al eliminar la solicitud.' });
  }
};

module.exports = { getAll, getById, create, patch, remove };
