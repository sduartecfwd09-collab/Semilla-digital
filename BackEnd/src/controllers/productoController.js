// ============================================================
// Controller: Producto
// Descripción: Orquesta las peticiones HTTP para productos
// ============================================================
const productoService = require('../services/productoService');

const getAll = async (req, res) => {
  try {
    const data = await productoService.findAll(req.query);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

const getById = async (req, res) => {
  try {
    const data = await productoService.findById(req.params.id);
    if (!data) {
      return res.status(404).json({ success: false, message: 'Producto no encontrado' });
    }
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

const getByUser = async (req, res) => {
  try {
    const data = await productoService.findByUser(req.params.userId);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

const create = async (req, res) => {
  try {
    const data = await productoService.create(req.body);
    return res.status(201).json({ success: true, data });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const update = async (req, res) => {
  try {
    const data = await productoService.update(req.params.id, req.body);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    if (error.message.includes('no encontrad')) {
      return res.status(404).json({ success: false, message: error.message });
    }
    return res.status(400).json({ success: false, message: error.message });
  }
};

const getByCategoria = async (req, res) => {
  try {
    const data = await productoService.findByCategoria(req.params.categoria);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

const toggleDisponible = async (req, res) => {
  try {
    const data = await productoService.toggleDisponible(req.params.id);
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
    await productoService.remove(req.params.id);
    return res.status(200).json({ success: true, data: { message: 'Producto eliminado correctamente' } });
  } catch (error) {
    if (error.message.includes('no encontrad')) {
      return res.status(404).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

module.exports = { getAll, getById, getByUser, getByCategoria, create, update, toggleDisponible, remove };
