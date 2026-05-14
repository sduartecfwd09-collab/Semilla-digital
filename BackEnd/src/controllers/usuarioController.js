'use strict';
const { Usuario } = require('../models');
const { Op } = require('sequelize');

// ── Helper: formatear errores de validación de Sequelize ──────────────────────
const formatValidationErrors = (error) => {
  if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
    return error.errors.map((e) => e.message).join(' | ');
  }
  return error.message;
};

// GET /usuarios
const getAll = async (req, res) => {
  try {
    const usuarios = await Usuario.findAll({
      order: [['createdAt', 'DESC']],
    });
    return res.json(usuarios);
  } catch (error) {
    console.error('[Usuario] getAll:', error);
    return res.status(500).json({ error: 'Error al obtener usuarios.' });
  }
};

// GET /usuarios/:id
const getById = async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id);
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado.' });
    return res.json(usuario);
  } catch (error) {
    console.error('[Usuario] getById:', error);
    return res.status(500).json({ error: 'Error al obtener el usuario.' });
  }
};

// POST /usuarios
const create = async (req, res) => {
  try {
    const { name, email, password, role, status, avatar, feriaId, puestoInfo } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Los campos name, email y password son obligatorios.' });
    }

    // Verificar email único
    const existing = await Usuario.findOne({ where: { email: email.toLowerCase().trim() } });
    if (existing) {
      return res.status(409).json({ error: 'Ya existe una cuenta registrada con este correo electrónico.' });
    }

    const usuario = await Usuario.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: password.trim(),
      role: role || 'Usuario',
      status: status || 'Activo',
      avatar: avatar || null,
      feriaId: feriaId || null,
      puestoInfo: puestoInfo || null,
    });

    return res.status(201).json(usuario);
  } catch (error) {
    console.error('[Usuario] create:', error);
    return res.status(400).json({ error: formatValidationErrors(error) });
  }
};

// PUT /usuarios/:id  (reemplazo completo)
const update = async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id);
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado.' });

    const { name, email, password, role, status, avatar, feriaId, puestoInfo } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'Los campos name y email son obligatorios.' });
    }

    // Verificar email único excluyendo al propio usuario
    const existing = await Usuario.findOne({
      where: { email: email.toLowerCase().trim(), id: { [Op.ne]: usuario.id } },
    });
    if (existing) {
      return res.status(409).json({ error: 'Este correo electrónico ya está registrado por otro usuario.' });
    }

    await usuario.update({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: password && password.trim() ? password.trim() : usuario.password,
      role: role || usuario.role,
      status: status || usuario.status,
      avatar: avatar !== undefined ? avatar : usuario.avatar,
      feriaId: feriaId !== undefined ? feriaId : usuario.feriaId,
      puestoInfo: puestoInfo !== undefined ? puestoInfo : usuario.puestoInfo,
    });

    return res.json(usuario);
  } catch (error) {
    console.error('[Usuario] update:', error);
    return res.status(400).json({ error: formatValidationErrors(error) });
  }
};

// PATCH /usuarios/:id  (actualización parcial — avatar, role, feriaId, etc.)
const patch = async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id);
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado.' });

    // Si se envía email, verificar unicidad
    if (req.body.email) {
      const existing = await Usuario.findOne({
        where: { email: req.body.email.toLowerCase().trim(), id: { [Op.ne]: usuario.id } },
      });
      if (existing) {
        return res.status(409).json({ error: 'Este correo electrónico ya está registrado por otro usuario.' });
      }
      req.body.email = req.body.email.toLowerCase().trim();
    }

    await usuario.update(req.body);
    return res.json(usuario);
  } catch (error) {
    console.error('[Usuario] patch:', error);
    return res.status(400).json({ error: formatValidationErrors(error) });
  }
};

// DELETE /usuarios/:id
const remove = async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id);
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado.' });
    await usuario.destroy();
    return res.json({ message: 'Usuario eliminado correctamente.' });
  } catch (error) {
    console.error('[Usuario] remove:', error);
    return res.status(500).json({ error: 'Error al eliminar el usuario.' });
  }
};

module.exports = { getAll, getById, create, update, patch, remove };
