// ============================================================
// Controller: MensajeContacto
// Descripción: Orquesta las peticiones HTTP para mensajes de
//              contacto del formulario público
// ============================================================
const mensajeService = require('../services/mensajeContactoService');

const getAll = async (req, res) => {
  try {
    const data = await mensajeService.findAll(req.query);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

const getById = async (req, res) => {
  try {
    const data = await mensajeService.findById(req.params.id);
    if (!data) {
      return res.status(404).json({ success: false, message: 'Mensaje no encontrado' });
    }
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

const create = async (req, res) => {
  try {
    const data = await mensajeService.create(req.body);
    return res.status(201).json({ success: true, data });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const reply = async (req, res) => {
  try {
    const data = await mensajeService.reply(req.params.id, req.body);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    if (error.message.includes('no encontrad')) {
      return res.status(404).json({ success: false, message: error.message });
    }
    return res.status(400).json({ success: false, message: error.message });
  }
};

const remove = async (req, res) => {
  try {
    await mensajeService.remove(req.params.id);
    return res.status(200).json({ success: true, data: { message: 'Mensaje eliminado correctamente' } });
  } catch (error) {
    if (error.message.includes('no encontrad')) {
      return res.status(404).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

const getPendientes = async (req, res) => {
  try {
    const data = await mensajeService.findPendientes();
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

module.exports = { getAll, getById, getPendientes, create, reply, remove };
