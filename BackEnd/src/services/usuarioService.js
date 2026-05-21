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

const findAll = async () => {
  return await Usuario.findAll({
    attributes: publicAttributes,
    include: includeRelations,
    order: [['createdAt', 'DESC']],
  });
};

const findById = async (id) => {
  return await Usuario.findByPk(id, {
    attributes: publicAttributes,
    include: includeRelations,
  });
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
};
