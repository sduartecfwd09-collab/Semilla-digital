'use strict';
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { Usuario, Role } = require('../models');
const { Op } = require('sequelize');
const permisoService = require('../services/permisoService');


const JWT_SECRET  = process.env.JWT_SECRET;
const JWT_EXPIRES = process.env.JWT_EXPIRES_IN || '8h';

// Helper: genera el token firmado
// Helper: genera el token firmado con permisos incluidos
const signToken = async (usuario, roleName) => {
  // Obtener permisos del rol para incluirlos en el JWT (optimización)
  const permisos = await permisoService.getPermisosByRoleId(usuario.roleId);
  
  return jwt.sign(
    { 
      id: usuario.id, 
      email: usuario.email, 
      role: roleName,
      roleId: usuario.roleId,
      permisos // Inyectamos el array de claves de permisos
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES }
  );
};


// Helper: usuario sin password
const safeUser = (usuario, roleName) => {
  const userJson = usuario.toJSON();
  delete userJson.password;
  return { ...userJson, role: roleName }; // Inyectamos el nombre del rol para el frontend
};

// ── POST /auth/login ──────────────────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son obligatorios.' });
    }

    const usuario = await Usuario.findOne({
      where: { email: email.toLowerCase().trim() },
      include: [{ model: Role, as: 'rol' }]
    });

    if (!usuario) {
      return res.status(401).json({ error: 'Credenciales incorrectas.' });
    }

    // Comparación con bcrypt
    const isMatch = await bcrypt.compare(password.trim(), usuario.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Credenciales incorrectas.' });
    }

    if (usuario.status === 'Inactivo') {
      return res.status(403).json({ error: 'Tu cuenta está inactiva. Contacta al administrador.' });
    }

    const roleName = usuario.rol ? usuario.rol.nombre : 'Usuario';
    const token = await signToken(usuario, roleName);

    // Configurar cookie httpOnly. `sameSite: 'lax'` permite el flujo
    // cross-port localhost (frontend en :5173, backend en :3002).
    // En producción con dominios distintos, ajustar a 'none' + secure: true.
    res.cookie('agromap_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 8 * 60 * 60 * 1000 // 8 horas
    });

    return res.json({
      token,
      user: safeUser(usuario, roleName),
    });
  } catch (error) {
    console.error('[Auth] login:', error);
    return res.status(500).json({ error: 'Error en el proceso de login.' });
  }
};


// ── POST /auth/register ───────────────────────────────────────────────────────
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

    // Buscar el ID del rol solicitado
    const roleName = role || 'Usuario';
    const dbRole = await Role.findOne({ where: { nombre: roleName } });
    if (!dbRole) {
      return res.status(400).json({ error: 'El rol especificado no es válido.' });
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password.trim(), 10);

    const usuario = await Usuario.create({
      name:     name.trim(),
      email:    email.toLowerCase().trim(),
      password: hashedPassword,
      roleId:   dbRole.id,
      status:   status || 'Activo',
      feriaId:  feriaId || null,
      puestoInfo: puestoInfo || null,
    });

    const token = await signToken(usuario, roleName);

    // Configurar cookie httpOnly (ver nota en login)
    res.cookie('agromap_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 8 * 60 * 60 * 1000
    });

    return res.status(201).json({
      token,
      user: safeUser(usuario, roleName),
    });
  } catch (error) {
    console.error('[Auth] register:', error);
    return res.status(400).json({ error: error.message });
  }
};


// ── GET /auth/me ──────────────────────────────────────────────────────────────
const me = async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.user.id, {
        include: [{ model: Role, as: 'rol' }]
    });
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado.' });

    const roleName = usuario.rol ? usuario.rol.nombre : 'Usuario';
    return res.json(safeUser(usuario, roleName));
  } catch (error) {
    console.error('[Auth] me:', error);
    return res.status(500).json({ error: 'Error al obtener el perfil.' });
  }
};


// ── POST /auth/logout ─────────────────────────────────────────────────────────
// Limpia la cookie httpOnly. El frontend no puede borrarla por sí mismo (esa
// es la idea de httpOnly), así que necesitamos un endpoint dedicado.
const logout = (_req, res) => {
  res.clearCookie('agromap_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
  return res.json({ success: true });
};

module.exports = { login, register, me, logout };
