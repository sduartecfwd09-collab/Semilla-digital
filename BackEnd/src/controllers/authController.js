'use strict';
const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');
const { Op } = require('sequelize');

const JWT_SECRET  = process.env.JWT_SECRET;
const JWT_EXPIRES = process.env.JWT_EXPIRES_IN || '8h';

// Helper: genera el token firmado
const signToken = (usuario) =>
  jwt.sign(
    { id: usuario.id, email: usuario.email, role: usuario.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES }
  );

// Helper: usuario sin password
const safeUser = (usuario) => {
  const { password, ...rest } = usuario.toJSON();
  return rest;
};

// ── POST /auth/login ──────────────────────────────────────────────────────────
// Body: { email, password }
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son obligatorios.' });
    }

    const usuario = await Usuario.findOne({
      where: { email: email.toLowerCase().trim() },
    });

    if (!usuario) {
      return res.status(401).json({ error: 'Credenciales incorrectas.' });
    }

    // Comparación directa (sin bcrypt, igual que el frontend original)
    if (usuario.password !== password.trim()) {
      return res.status(401).json({ error: 'Credenciales incorrectas.' });
    }

    if (usuario.status === 'Inactivo') {
      return res.status(403).json({ error: 'Tu cuenta está inactiva. Contacta al administrador.' });
    }

    const token = signToken(usuario);

    return res.json({
      token,
      user: safeUser(usuario),
    });
  } catch (error) {
    console.error('[Auth] login:', error);
    return res.status(500).json({ error: 'Error en el proceso de login.' });
  }
};

// ── POST /auth/register ───────────────────────────────────────────────────────
// Body: { name, email, password, role?, status? }
const register = async (req, res) => {
  try {
    const { name, email, password, role, status, feriaId, puestoInfo } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Los campos name, email y password son obligatorios.' });
    }

    const existing = await Usuario.findOne({
      where: { email: email.toLowerCase().trim() },
    });
    if (existing) {
      return res.status(409).json({ error: 'Ya existe una cuenta registrada con este correo electrónico.' });
    }

    const usuario = await Usuario.create({
      name:     name.trim(),
      email:    email.toLowerCase().trim(),
      password: password.trim(),
      role:     role   || 'Usuario',
      status:   status || 'Activo',
      feriaId:  feriaId || null,
      puestoInfo: puestoInfo || null,
    });

    const token = signToken(usuario);

    return res.status(201).json({
      token,
      user: safeUser(usuario),
    });
  } catch (error) {
    console.error('[Auth] register:', error);
    const msg =
      error.name === 'SequelizeValidationError'
        ? error.errors.map((e) => e.message).join(' | ')
        : error.message;
    return res.status(400).json({ error: msg });
  }
};

// ── GET /auth/me ──────────────────────────────────────────────────────────────
// Requiere Authorization: Bearer <token>
const me = async (req, res) => {
  try {
    // req.user viene del middleware verifyToken
    const usuario = await Usuario.findByPk(req.user.id);
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado.' });
    return res.json(safeUser(usuario));
  } catch (error) {
    console.error('[Auth] me:', error);
    return res.status(500).json({ error: 'Error al obtener el perfil.' });
  }
};

module.exports = { login, register, me };
