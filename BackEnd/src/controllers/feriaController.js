'use strict';
const { Feria } = require('../models');

const formatValidationErrors = (error) => {
  if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
    return error.errors.map((e) => e.message).join(' | ');
  }
  return error.message;
};

// GET /ferias
const getAll = async (req, res) => {
  try {
    const ferias = await Feria.findAll({ order: [['nombre', 'ASC']] });
    return res.json(ferias);
  } catch (error) {
    console.error('[Feria] getAll:', error);
    return res.status(500).json({ error: 'Error al obtener las ferias.' });
  }
};

// GET /ferias/:id
const getById = async (req, res) => {
  try {
    const feria = await Feria.findByPk(req.params.id);
    if (!feria) return res.status(404).json({ error: 'Feria no encontrada.' });
    return res.json(feria);
  } catch (error) {
    console.error('[Feria] getById:', error);
    return res.status(500).json({ error: 'Error al obtener la feria.' });
  }
};

// POST /ferias
// El frontend puede enviar {name, province, location, schedule} o {nombre, provincia, direccion, dias, horario}
const create = async (req, res) => {
  try {
    const body = req.body;

    // Normalizar campos (el frontend tiene dos formatos según si sync desde Google o creación manual)
    const nombre = (body.nombre || body.name || '').trim();
    const provincia = (body.provincia || body.province || 'Otras').trim();
    const direccion = (body.direccion || body.location || '').trim();

    // schedule = "Sábados, 05:00 - 13:00" → split
    let dias = body.dias || '';
    let horario = body.horario || '';
    if (!dias && body.schedule) {
      const parts = body.schedule.split(',');
      dias = (parts[0] || 'Sábados').trim();
      horario = (parts[1] || '05:00 - 13:00').trim();
    }
    dias = dias || 'Sábados';
    horario = horario || '05:00 - 13:00';

    if (!nombre) {
      return res.status(400).json({ error: 'El nombre de la feria es obligatorio.' });
    }

    const feria = await Feria.create({ nombre, provincia, direccion, dias, horario });
    return res.status(201).json(feria);
  } catch (error) {
    console.error('[Feria] create:', error);
    return res.status(400).json({ error: formatValidationErrors(error) });
  }
};

// PUT /ferias/:id
const update = async (req, res) => {
  try {
    const feria = await Feria.findByPk(req.params.id);
    if (!feria) return res.status(404).json({ error: 'Feria no encontrada.' });

    const body = req.body;
    const nombre = (body.nombre || body.name || feria.nombre).trim();
    const provincia = (body.provincia || body.province || feria.provincia).trim();
    const direccion = (body.direccion || body.location || feria.direccion || '').trim();
    let dias = body.dias || feria.dias;
    let horario = body.horario || feria.horario;
    if (body.schedule && !body.dias) {
      const parts = body.schedule.split(',');
      dias = (parts[0] || feria.dias).trim();
      horario = (parts[1] || feria.horario).trim();
    }

    await feria.update({ nombre, provincia, direccion, dias, horario });
    return res.json(feria);
  } catch (error) {
    console.error('[Feria] update:', error);
    return res.status(400).json({ error: formatValidationErrors(error) });
  }
};

// DELETE /ferias/:id
const remove = async (req, res) => {
  try {
    const feria = await Feria.findByPk(req.params.id);
    if (!feria) return res.status(404).json({ error: 'Feria no encontrada.' });
    await feria.destroy();
    return res.json({ message: 'Feria eliminada correctamente.' });
  } catch (error) {
    console.error('[Feria] remove:', error);
    return res.status(500).json({ error: 'Error al eliminar la feria.' });
  }
};

module.exports = { getAll, getById, create, update, remove };
