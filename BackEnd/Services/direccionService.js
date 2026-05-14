// ============================================================
// Service: Direccion
// Descripción: Lógica de negocio para direcciones
// ============================================================
const { Direccion, Provincia, Canton, Distrito } = require('../Models');

const includeGeo = [
  { model: Provincia, as: 'provincia' },
  { model: Canton, as: 'canton' },
  { model: Distrito, as: 'distrito' },
];

const findAll = async () => {
  return await Direccion.findAll({
    include: includeGeo,
  });
};

const findById = async (id) => {
  return await Direccion.findByPk(id, {
    include: includeGeo,
  });
};

const create = async (data) => {
  return await Direccion.create(data);
};

const update = async (id, data) => {
  const direccion = await Direccion.findByPk(id);
  if (!direccion) {
    throw new Error('Dirección no encontrada');
  }
  return await direccion.update(data);
};

const remove = async (id) => {
  const direccion = await Direccion.findByPk(id);
  if (!direccion) {
    throw new Error('Dirección no encontrada');
  }
  await direccion.destroy();
  return true;
};

module.exports = { findAll, findById, create, update, remove };
