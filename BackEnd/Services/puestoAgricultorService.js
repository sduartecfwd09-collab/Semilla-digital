// ============================================================
// Service: PuestoAgricultor
// Descripción: Lógica de negocio para puestos de agricultor
// ============================================================
const {
  PuestoAgricultor,
  Usuario,
  Feria,
  Direccion,
  Provincia,
  Canton,
  Distrito,
} = require('../Models');

const includeAll = [
  { model: Usuario, as: 'usuario', attributes: ['id', 'name', 'nombre', 'email', 'role'] },
  { model: Feria, as: 'feriaPrincipal' },
  {
    model: Direccion,
    as: 'direccion',
    include: [
      { model: Provincia, as: 'provincia' },
      { model: Canton, as: 'canton' },
      { model: Distrito, as: 'distrito' },
    ],
  },
  { model: Feria, as: 'ferias', through: { attributes: [] } },
];

const findAll = async (query = {}) => {
  return await PuestoAgricultor.findAll({
    include: includeAll,
    order: [['fecha_registro', 'DESC']],
  });
};

const findById = async (id) => {
  return await PuestoAgricultor.findByPk(id, {
    include: includeAll,
  });
};

const findByUsuario = async (usuarioId) => {
  return await PuestoAgricultor.findOne({
    where: { usuario_id: usuarioId },
    include: includeAll,
  });
};

const findByFeria = async (feriaId) => {
  return await PuestoAgricultor.findAll({
    where: { feria_id: feriaId },
    include: [
      { model: Usuario, as: 'usuario', attributes: ['id', 'name', 'nombre', 'email'] },
    ],
    order: [['nombre_puesto', 'ASC']],
  });
};

const create = async (data) => {
  if (!data.nombre_puesto) {
    throw new Error('El nombre del puesto es requerido');
  }
  if (!data.usuario_id) {
    throw new Error('El usuario es requerido');
  }

  // Verificar que el usuario no tenga ya un puesto (relación 1:1)
  const existing = await PuestoAgricultor.findOne({
    where: { usuario_id: data.usuario_id },
  });
  if (existing) {
    throw new Error('Este usuario ya tiene un puesto registrado');
  }

  return await PuestoAgricultor.create({
    ...data,
    fecha_registro: new Date(),
  });
};

const update = async (id, data) => {
  const puesto = await PuestoAgricultor.findByPk(id);
  if (!puesto) {
    throw new Error('Puesto no encontrado');
  }
  return await puesto.update(data);
};

const remove = async (id) => {
  const puesto = await PuestoAgricultor.findByPk(id);
  if (!puesto) {
    throw new Error('Puesto no encontrado');
  }
  await puesto.destroy();
  return true;
};

module.exports = { findAll, findById, findByUsuario, findByFeria, create, update, remove };
