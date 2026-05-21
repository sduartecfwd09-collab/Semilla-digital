'use strict';
const { Precio } = require('../models');

const formatValidationErrors = (error) => {
  if (error.name === 'SequelizeValidationError') {
    return error.errors.map((e) => e.message).join(' | ');
  }
  return error.message;
};

// GET /precios
const getAll = async (req, res) => {
  try {
    const precios = await Precio.findAll({ order: [['createdAt', 'DESC']] });
    return res.json(precios.map((p) => ({ ...p.toJSON(), precio: parseFloat(p.precio) })));
  } catch (error) {
    console.error('[Precio] getAll:', error);
    return res.status(500).json({ error: 'Error al obtener los precios.' });
  }
};

// GET /precios/:id
const getById = async (req, res) => {
  try {
    const precio = await Precio.findByPk(req.params.id);
    if (!precio) return res.status(404).json({ error: 'Precio no encontrado.' });
    return res.json({ ...precio.toJSON(), precio: parseFloat(precio.precio) });
  } catch (error) {
    console.error('[Precio] getById:', error);
    return res.status(500).json({ error: 'Error al obtener el precio.' });
  }
};

// PATCH /precios/:id
const patch = async (req, res) => {
  try {
    const precio = await Precio.findByPk(req.params.id);
    if (!precio) return res.status(404).json({ error: 'Precio no encontrado.' });

    if (req.body.precio !== undefined && parseFloat(req.body.precio) < 0) {
      return res.status(400).json({ error: 'El precio no puede ser negativo.' });
    }

    await precio.update(req.body);
    return res.json({ ...precio.toJSON(), precio: parseFloat(precio.precio) });
  } catch (error) {
    console.error('[Precio] patch:', error);
    return res.status(400).json({ error: formatValidationErrors(error) });
  }
};

// DELETE /precios/:id
const remove = async (req, res) => {
  try {
    const precio = await Precio.findByPk(req.params.id);
    if (!precio) return res.status(404).json({ error: 'Precio no encontrado.' });
    await precio.destroy();
    return res.json({ message: 'Precio eliminado correctamente.' });
  } catch (error) {
    console.error('[Precio] remove:', error);
    return res.status(500).json({ error: 'Error al eliminar el precio.' });
  }
};

module.exports = { getAll, getById, patch, remove };
