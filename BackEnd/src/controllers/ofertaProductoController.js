// ============================================================
// Controller: OfertaProducto
// Descripción: Orquesta las peticiones HTTP para ofertas de
//              productos en ferias
// ============================================================
const ofertaService = require('../services/ofertaProductoService');

const getAll = async (req, res) => {
  try {
    const data = await ofertaService.findAll(req.query);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

const getById = async (req, res) => {
  try {
    const data = await ofertaService.findById(req.params.id);
    if (!data) {
      return res.status(404).json({ success: false, message: 'Oferta no encontrada' });
    }
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

const getByFeria = async (req, res) => {
  try {
    const data = await ofertaService.findByFeria(req.params.feriaId);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

const getByProducto = async (req, res) => {
  try {
    const data = await ofertaService.findByProducto(req.params.productoId);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

const create = async (req, res) => {
  try {
    const data = await ofertaService.create(req.body);
    return res.status(201).json({ success: true, data });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const update = async (req, res) => {
  try {
    const data = await ofertaService.update(req.params.id, req.body);
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
    await ofertaService.remove(req.params.id);
    return res.status(200).json({ success: true, data: { message: 'Oferta eliminada correctamente' } });
  } catch (error) {
    if (error.message.includes('no encontrad')) {
      return res.status(404).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

module.exports = { getAll, getById, getByFeria, getByProducto, create, update, remove };
