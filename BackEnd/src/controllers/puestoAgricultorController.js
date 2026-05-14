'use strict';
const { PuestoAgricultor, Usuario, Feria } = require('../models');

const formatValidationErrors = (error) => {
  if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
    return error.errors.map((e) => e.message).join(' | ');
  }
  return error.message;
};

// GET /puestosAgricultor  o  GET /puestosAgricultor?usuarioId=X
const getAll = async (req, res) => {
  try {
    const where = {};
    if (req.query.usuarioId) {
      where.usuarioId = req.query.usuarioId;
    }

    const puestos = await PuestoAgricultor.findAll({
      where,
      order: [['fechaRegistro', 'DESC']],
    });
    return res.json(puestos);
  } catch (error) {
    console.error('[PuestoAgricultor] getAll:', error);
    return res.status(500).json({ error: 'Error al obtener los puestos.' });
  }
};

// GET /puestosAgricultor/:id
const getById = async (req, res) => {
  try {
    const puesto = await PuestoAgricultor.findByPk(req.params.id);
    if (!puesto) return res.status(404).json({ error: 'Puesto no encontrado.' });
    return res.json(puesto);
  } catch (error) {
    console.error('[PuestoAgricultor] getById:', error);
    return res.status(500).json({ error: 'Error al obtener el puesto.' });
  }
};

// POST /puestosAgricultor
const create = async (req, res) => {
  try {
    const {
      usuarioId, nombrePuesto, descripcion, ubicacion,
      telefono, email, horarios, horariosList, feriaId,
      tiposProducto, fotosNombres, fotosBase64,
      metodosCultivo, redesSociales, fechaRegistro,
    } = req.body;

    if (!usuarioId || !nombrePuesto) {
      return res.status(400).json({ error: 'Los campos usuarioId y nombrePuesto son obligatorios.' });
    }

    const puesto = await PuestoAgricultor.create({
      usuarioId,
      nombrePuesto: nombrePuesto.trim(),
      descripcion: descripcion?.trim() || '',
      ubicacion: Array.isArray(ubicacion) ? ubicacion : [],
      telefono: telefono || '',
      email: email || '',
      horarios: horarios || '',
      horariosList: Array.isArray(horariosList) ? horariosList : [],
      feriaId: feriaId || null,
      tiposProducto: Array.isArray(tiposProducto) ? tiposProducto : [],
      fotosNombres: Array.isArray(fotosNombres) ? fotosNombres : [],
      fotosBase64: Array.isArray(fotosBase64) ? fotosBase64 : [],
      metodosCultivo: metodosCultivo || '',
      redesSociales: redesSociales || '',
      fechaRegistro: fechaRegistro || new Date(),
    });

    return res.status(201).json(puesto);
  } catch (error) {
    console.error('[PuestoAgricultor] create:', error);
    return res.status(400).json({ error: formatValidationErrors(error) });
  }
};

// PUT /puestosAgricultor/:id  (reemplazo completo)
const update = async (req, res) => {
  try {
    const puesto = await PuestoAgricultor.findByPk(req.params.id);
    if (!puesto) return res.status(404).json({ error: 'Puesto no encontrado.' });

    const {
      nombrePuesto, descripcion, ubicacion,
      telefono, email, horarios, horariosList, feriaId,
      tiposProducto, fotosNombres, fotosBase64,
      metodosCultivo, redesSociales,
    } = req.body;

    await puesto.update({
      nombrePuesto: nombrePuesto ? nombrePuesto.trim() : puesto.nombrePuesto,
      descripcion: descripcion !== undefined ? descripcion.trim() : puesto.descripcion,
      ubicacion: Array.isArray(ubicacion) ? ubicacion : puesto.ubicacion,
      telefono: telefono !== undefined ? telefono : puesto.telefono,
      email: email !== undefined ? email : puesto.email,
      horarios: horarios !== undefined ? horarios : puesto.horarios,
      horariosList: Array.isArray(horariosList) ? horariosList : puesto.horariosList,
      feriaId: feriaId !== undefined ? feriaId : puesto.feriaId,
      tiposProducto: Array.isArray(tiposProducto) ? tiposProducto : puesto.tiposProducto,
      fotosNombres: Array.isArray(fotosNombres) ? fotosNombres : puesto.fotosNombres,
      fotosBase64: Array.isArray(fotosBase64) ? fotosBase64 : puesto.fotosBase64,
      metodosCultivo: metodosCultivo !== undefined ? metodosCultivo : puesto.metodosCultivo,
      redesSociales: redesSociales !== undefined ? redesSociales : puesto.redesSociales,
    });

    return res.json(puesto);
  } catch (error) {
    console.error('[PuestoAgricultor] update:', error);
    return res.status(400).json({ error: formatValidationErrors(error) });
  }
};

// PATCH /puestosAgricultor/:id  (actualización parcial)
const patch = async (req, res) => {
  try {
    const puesto = await PuestoAgricultor.findByPk(req.params.id);
    if (!puesto) return res.status(404).json({ error: 'Puesto no encontrado.' });
    await puesto.update(req.body);
    return res.json(puesto);
  } catch (error) {
    console.error('[PuestoAgricultor] patch:', error);
    return res.status(400).json({ error: formatValidationErrors(error) });
  }
};

// DELETE /puestosAgricultor/:id
const remove = async (req, res) => {
  try {
    const puesto = await PuestoAgricultor.findByPk(req.params.id);
    if (!puesto) return res.status(404).json({ error: 'Puesto no encontrado.' });
    await puesto.destroy();
    return res.json({ message: 'Puesto eliminado correctamente.' });
  } catch (error) {
    console.error('[PuestoAgricultor] remove:', error);
    return res.status(500).json({ error: 'Error al eliminar el puesto.' });
  }
};

module.exports = { getAll, getById, create, update, patch, remove };
