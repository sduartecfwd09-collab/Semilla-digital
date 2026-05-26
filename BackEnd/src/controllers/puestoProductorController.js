// ============================================================
// Controller: PuestoProductor
// Descripción: Orquesta las peticiones HTTP para puestos
//              de productor
// ============================================================
const puestoService = require('../services/puestoProductorService');

const getAll = async (req, res) => {
  try {
    const data = await puestoService.findAll(req.query);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

const getById = async (req, res) => {
  try {
    const data = await puestoService.findById(req.params.id);
    if (!data) {
      return res.status(404).json({ success: false, message: 'Puesto no encontrado' });
    }
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

const getByUsuario = async (req, res) => {
  try {
    const data = await puestoService.findByUsuario(req.params.usuarioId);
    if (!data) {
      return res.status(404).json({ success: false, message: 'Este usuario no tiene un puesto registrado' });
    }
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

const getByFeria = async (req, res) => {
  try {
    const data = await puestoService.findByFeria(req.params.feriaId);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

const create = async (req, res) => {
  try {
    const data = await puestoService.create(req.body);
    return res.status(201).json({ success: true, data });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const update = async (req, res) => {
  try {
    const data = await puestoService.update(req.params.id, req.body);
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
    await puestoService.remove(req.params.id);
    return res.status(200).json({ success: true, data: { message: 'Puesto eliminado correctamente' } });
  } catch (error) {
    if (error.message.includes('no encontrad')) {
      return res.status(404).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

// POST /puestos/:id/ferias  body { feriaId }
const addFeria = async (req, res) => {
  try {
    const { feriaId } = req.body;
    if (!feriaId) {
      return res.status(400).json({ success: false, message: 'feriaId es requerido' });
    }
    const data = await puestoService.addFeria(req.params.id, feriaId);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('[PuestoController.addFeria]', error);
    return res.status(error.status || 500).json({ success: false, message: error.message });
  }
};

// DELETE /puestos/:id/ferias/:feriaId
const removeFeria = async (req, res) => {
  try {
    const data = await puestoService.removeFeria(req.params.id, req.params.feriaId);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('[PuestoController.removeFeria]', error);
    return res.status(error.status || 500).json({ success: false, message: error.message });
  }
};

module.exports = { getAll, getById, getByUsuario, getByFeria, create, update, remove, addFeria, removeFeria };
