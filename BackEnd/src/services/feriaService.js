// ============================================================
// Service: Feria
// Descripción: Lógica de negocio para ferias
// ============================================================
const { Feria, Direccion, Provincia, Canton, Distrito } = require('../models');

const includeDireccion = {
  model: Direccion,
  as: 'direccion',
  include: [
    { model: Provincia, as: 'provincia' },
    { model: Canton, as: 'canton' },
    { model: Distrito, as: 'distrito' },
  ],
};

const findAll = async () => {
  return await Feria.findAll({
    include: [includeDireccion],
    order: [['nombre', 'ASC']],
  });
};

const findById = async (id) => {
  return await Feria.findByPk(id, {
    include: [includeDireccion],
  });
};

const create = async (data) => {
  if (!data.nombre) {
    throw new Error('El nombre de la feria es requerido');
  }
  return await Feria.create(data);
};

const update = async (id, data) => {
  const feria = await Feria.findByPk(id);
  if (!feria) {
    throw new Error('Feria no encontrada');
  }
  return await feria.update(data);
};

const remove = async (id) => {
  const feria = await Feria.findByPk(id);
  if (!feria) {
    throw new Error('Feria no encontrada');
  }
  await feria.destroy();
  return true;
};

module.exports = { findAll, findById, create, update, remove };
