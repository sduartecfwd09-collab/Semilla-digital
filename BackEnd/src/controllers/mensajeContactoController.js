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

// GET /mensajes/mios → solo los mensajes cuyo `correo` coincide con el email
// del usuario autenticado (extraído del JWT). Lo consume el buzón personal
// en ContactUs y las notificaciones del Navbar.
const getMios = async (req, res) => {
  try {
    const myEmail = (req.user && req.user.email ? req.user.email : '').toLowerCase();
    if (!myEmail) {
      return res.status(401).json({ success: false, message: 'No autenticado' });
    }
    const all = await mensajeService.findAll(req.query);
    const mine = all.filter(m => (m.correo || '').toLowerCase() === myEmail);
    return res.status(200).json({ success: true, data: mine });
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

// Verifica que un usuario no-admin solo pueda tocar mensajes con su mismo correo.
// Devuelve true si está autorizado; si no, escribe 403/404 en `res` y devuelve false.
const ensureOwnerOrAdmin = async (req, res) => {
  if (req.user && req.user.role === 'Administrador') return true;
  const existing = await mensajeService.findById(req.params.id);
  if (!existing) {
    res.status(404).json({ success: false, message: 'Mensaje no encontrado' });
    return false;
  }
  const myEmail = (req.user && req.user.email ? req.user.email : '').toLowerCase();
  if ((existing.correo || '').toLowerCase() !== myEmail) {
    res.status(403).json({ success: false, message: 'No tenés permiso sobre este mensaje' });
    return false;
  }
  return true;
};

const update = async (req, res) => {
  try {
    if (!(await ensureOwnerOrAdmin(req, res))) return;
    const data = await mensajeService.update(req.params.id, req.body);
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
    if (!(await ensureOwnerOrAdmin(req, res))) return;
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

module.exports = { getAll, getMios, getById, getPendientes, create, reply, update, remove };
