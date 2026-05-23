// ============================================================
// Service: Usuario
// Descripción: Lógica de negocio para usuarios
//              Incluye hash de password y validación de login
// ============================================================
const bcrypt = require('bcrypt');
const { Usuario, Feria, Direccion, Role } = require('../models');

const SALT_ROUNDS = 10;

// ── Includes reutilizables ──────────────────────────────────
const includeRelations = [
  { model: Feria, as: 'feria' },
  { model: Direccion, as: 'direccion' },
  { model: Role, as: 'rol' },
];

// Atributos que se excluyen en las respuestas públicas
const publicAttributes = { exclude: ['password'] };

// ── CRUD ────────────────────────────────────────────────────

// Mapea la instancia/POJO de Usuario para incluir `role` como string plano
// derivado de la relación `rol` (la tabla guarda roleId). Esto es lo que
// consume el frontend para mostrar y filtrar.
const mapUsuario = (u) => {
  if (!u) return null;
  const raw = u.toJSON ? u.toJSON() : u;
  return { ...raw, role: raw.rol ? raw.rol.nombre : null };
};

const findAll = async (query = {}) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 20;
  const offset = (page - 1) * limit;

  const { rows, count } = await Usuario.findAndCountAll({
    limit,
    offset,
    attributes: publicAttributes,
    include: includeRelations,
    order: [['createdAt', 'DESC']],
  });
  
  return {
    rows: rows.map(mapUsuario),
    count,
  };
};

const findById = async (id) => {
  const u = await Usuario.findByPk(id, {
    attributes: publicAttributes,
    include: includeRelations,
  });
  return mapUsuario(u);
};

const findByEmail = async (email) => {
  return await Usuario.findOne({
    where: { email },
    include: includeRelations,
  });
};

const create = async (data) => {
  if (!data.email) throw new Error('El email es requerido');
  if (!data.password) throw new Error('La contraseña es requerida');

  const existing = await Usuario.findOne({ where: { email: data.email } });
  if (existing) throw new Error('Ya existe un usuario con ese email');

  // Manejo de Role (convertir nombre a ID si es necesario)
  if (data.role && !data.roleId) {
    const dbRole = await Role.findOne({ where: { nombre: data.role } });
    if (dbRole) data.roleId = dbRole.id;
  }

  const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

  const usuario = await Usuario.create({
    ...data,
    password: hashedPassword,
  });

  const result = usuario.toJSON();
  delete result.password;
  return result;
};

const register = async (data) => {
  return await create({
    ...data,
    status: 'Activo',
  });
};

const update = async (id, data) => {
  const usuario = await Usuario.findByPk(id);
  if (!usuario) throw new Error('Usuario no encontrado');

  if (data.password) {
    data.password = await bcrypt.hash(data.password, SALT_ROUNDS);
  }

  // Manejo de Role en update
  if (data.role && !data.roleId) {
    const dbRole = await Role.findOne({ where: { nombre: data.role } });
    if (dbRole) data.roleId = dbRole.id;
  }

  await usuario.update(data);
  const result = usuario.toJSON();
  delete result.password;
  return result;
};

const changeStatus = async (id, status) => {
  const usuario = await Usuario.findByPk(id);
  if (!usuario) throw new Error('Usuario no encontrado');
  await usuario.update({ status });
  const result = usuario.toJSON();
  delete result.password;
  return result;
};

const assignFeria = async (id, feriaId) => {
  const usuario = await Usuario.findByPk(id);
  if (!usuario) throw new Error('Usuario no encontrado');
  await usuario.update({ feriaId });
  const result = usuario.toJSON();
  delete result.password;
  return result;
};

const remove = async (id) => {
  const usuario = await Usuario.findByPk(id);
  if (!usuario) throw new Error('Usuario no encontrado');
  await usuario.destroy();
  return true;
};

// ── AUTH ─────────────────────────────────────────────────────

const validatePassword = async (email, password) => {
  const usuario = await Usuario.findOne({
    where: { email },
    include: [{ model: Role, as: 'rol' }]
  });
  if (!usuario) throw new Error('Credenciales inválidas: usuario no encontrado');
  if (usuario.status === 'Inactivo') throw new Error('La cuenta se encuentra inactiva');

  const isValid = await bcrypt.compare(password, usuario.password);
  if (!isValid) throw new Error('Credenciales inválidas: contraseña incorrecta');

  return usuario;
};

const changePassword = async (id, currentPassword, newPassword) => {
  if (!currentPassword || !newPassword) {
    throw new Error('Se requiere la contraseña actual y la nueva');
  }
  if (newPassword.length < 8) {
    throw new Error('La nueva contraseña debe tener al menos 8 caracteres');
  }

  const usuario = await Usuario.findByPk(id);
  if (!usuario) throw new Error('Usuario no encontrado');

  const isValid = await bcrypt.compare(currentPassword, usuario.password);
  if (!isValid) throw new Error('La contraseña actual no es correcta');

  const hashed = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await usuario.update({ password: hashed });
  return true;
};

module.exports = {
  findAll,
  findById,
  findByEmail,
  create,
  register,
  update,
  changeStatus,
  assignFeria,
  remove,
  validatePassword,
  changePassword,
};
