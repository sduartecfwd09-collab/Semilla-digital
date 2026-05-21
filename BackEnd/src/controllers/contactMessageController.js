'use strict';
const { ContactMessage } = require('../models');

const formatValidationErrors = (error) => {
  if (error.name === 'SequelizeValidationError') {
    return error.errors.map((e) => e.message).join(' | ');
  }
  return error.message;
};

// GET /contactMessages
const getAll = async (req, res) => {
  try {
    const messages = await ContactMessage.findAll({
      order: [['fechaEnvio', 'DESC']],
    });
    return res.json(messages);
  } catch (error) {
    console.error('[ContactMessage] getAll:', error);
    return res.status(500).json({ error: 'Error al obtener los mensajes.' });
  }
};

// GET /contactMessages/:id
const getById = async (req, res) => {
  try {
    const msg = await ContactMessage.findByPk(req.params.id);
    if (!msg) return res.status(404).json({ error: 'Mensaje no encontrado.' });
    return res.json(msg);
  } catch (error) {
    console.error('[ContactMessage] getById:', error);
    return res.status(500).json({ error: 'Error al obtener el mensaje.' });
  }
};

// POST /contactMessages
const create = async (req, res) => {
  try {
    const { nombre, correo, telefono, mensaje, fechaEnvio } = req.body;

    if (!nombre || !correo || !mensaje) {
      return res.status(400).json({ error: 'Los campos nombre, correo y mensaje son obligatorios.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo.trim())) {
      return res.status(400).json({ error: 'El correo no tiene un formato válido.' });
    }

    const msg = await ContactMessage.create({
      nombre: nombre.trim(),
      correo: correo.trim(),
      telefono: telefono || '',
      mensaje: mensaje.trim(),
      respuesta: '',
      fechaEnvio: fechaEnvio || new Date(),
      fechaRespuesta: null,
      estado: 'Pendiente',
    });

    return res.status(201).json(msg);
  } catch (error) {
    console.error('[ContactMessage] create:', error);
    return res.status(400).json({ error: formatValidationErrors(error) });
  }
};

// PATCH /contactMessages/:id
// Usado para: editar mensaje, responder (añade respuesta + fechaRespuesta + estado:'Respondido')
const patch = async (req, res) => {
  try {
    const msg = await ContactMessage.findByPk(req.params.id);
    if (!msg) return res.status(404).json({ error: 'Mensaje no encontrado.' });

    const { nombre, correo, telefono, mensaje, respuesta, fechaRespuesta, estado } = req.body;

    await msg.update({
      nombre: nombre ? nombre.trim() : msg.nombre,
      correo: correo ? correo.trim() : msg.correo,
      telefono: telefono !== undefined ? telefono : msg.telefono,
      mensaje: mensaje ? mensaje.trim() : msg.mensaje,
      respuesta: respuesta !== undefined ? respuesta : msg.respuesta,
      fechaRespuesta: fechaRespuesta || (respuesta ? new Date() : msg.fechaRespuesta),
      estado: estado ||
        (respuesta && respuesta.trim() ? 'Respondido' : msg.estado),
    });

    return res.json(msg);
  } catch (error) {
    console.error('[ContactMessage] patch:', error);
    return res.status(400).json({ error: formatValidationErrors(error) });
  }
};

// DELETE /contactMessages/:id
const remove = async (req, res) => {
  try {
    const msg = await ContactMessage.findByPk(req.params.id);
    if (!msg) return res.status(404).json({ error: 'Mensaje no encontrado.' });
    await msg.destroy();
    return res.json({ message: 'Mensaje eliminado correctamente.' });
  } catch (error) {
    console.error('[ContactMessage] remove:', error);
    return res.status(500).json({ error: 'Error al eliminar el mensaje.' });
  }
};

module.exports = { getAll, getById, create, patch, remove };
