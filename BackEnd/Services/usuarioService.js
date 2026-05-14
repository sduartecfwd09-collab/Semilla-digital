// ============================================================
// Service: Usuario
// Descripción: Lógica de negocio para usuarios
//              Incluye hash de password y validación de login
// ============================================================
const bcrypt = require('bcrypt');
const { Usuario, Feria, Direccion } = require('../Models');

const SALT_ROUNDS = 10;

// ── Includes reutilizables ──────────────────────────────────
const includeRelations = [
  { model: Feria, as: 'feria' },
  { model: Direccion, as: 'direccion' },
];

// Atributos que se excluyen en las respuestas públicas
const publicAttributes = { exclude: ['password'] };

// ── CRUD ────────────────────────────────────────────────────

const findAll = async () => {
  return await Usuario.findAll({
    attributes: publicAttributes,
    include: includeRelations,
    order: [['created_at', 'DESC']],
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
  if (!data.email) {
    throw new Error('El email es requerido');
  }
  if (!data.password) {
    throw new Error('La contraseña es requerida');
  }

  // Verificar si el email ya existe
  const existing = await Usuario.findOne({ where: { email: data.email } });
  if (existing) {
    throw new Error('Ya existe un usuario con ese email');
  }

  // Hashear la contraseña
  const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

  const usuario = await Usuario.create({
    ...data,
    password: hashedPassword,
  });

  // Retornar sin password
  const result = usuario.toJSON();
  delete result.password;
  return result;
};

const register = async (data) => {
  // register es un alias de create con validación adicional
  if (!data.email || !data.password) {
    throw new Error('Email y contraseña son requeridos para el registro');
  }
  return await create({
    ...data,
    role: data.role || 'Usuario',
    status: 'Activo',
  });
};

const update = async (id, data) => {
  const usuario = await Usuario.findByPk(id);
  if (!usuario) {
    throw new Error('Usuario no encontrado');
  }

  // Si se envía un nuevo password, hashearlo
  if (data.password) {
    data.password = await bcrypt.hash(data.password, SALT_ROUNDS);
  }

  await usuario.update(data);

  // Retornar sin password
  const result = usuario.toJSON();
  delete result.password;
  return result;
};

const changeStatus = async (id, status) => {
  const usuario = await Usuario.findByPk(id);
  if (!usuario) {
    throw new Error('Usuario no encontrado');
  }
  await usuario.update({ status });
  const result = usuario.toJSON();
  delete result.password;
  return result;
};

const assignFeria = async (id, feriaId) => {
  const usuario = await Usuario.findByPk(id);
  if (!usuario) {
    throw new Error('Usuario no encontrado');
  }
  await usuario.update({ feria_id: feriaId });
  const result = usuario.toJSON();
  delete result.password;
  return result;
};

const remove = async (id) => {
  const usuario = await Usuario.findByPk(id);
  if (!usuario) {
    throw new Error('Usuario no encontrado');
  }
  await usuario.destroy();
  return true;
};

// ── AUTH ─────────────────────────────────────────────────────

const validatePassword = async (email, password) => {
  const usuario = await Usuario.findOne({ where: { email } });
  if (!usuario) {
    throw new Error('Credenciales inválidas: usuario no encontrado');
  }

  if (usuario.status === 'Inactivo') {
    throw new Error('La cuenta se encuentra inactiva');
  }

  const isValid = await bcrypt.compare(password, usuario.password);
  if (!isValid) {
    throw new Error('Credenciales inválidas: contraseña incorrecta');
  }

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
