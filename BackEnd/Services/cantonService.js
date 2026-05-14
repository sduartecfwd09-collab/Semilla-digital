// ============================================================
// Service: Canton
// Descripción: Lógica de negocio para cantones
// ============================================================
const { Canton, Provincia } = require('../Models');

const findAll = async () => {
  return await Canton.findAll({
    include: [{ model: Provincia, as: 'provincia' }],
    order: [['nombre', 'ASC']],
  });
};

const findById = async (id) => {
  return await Canton.findByPk(id, {
    include: [{ model: Provincia, as: 'provincia' }],
  });
};

const findByProvincia = async (provinciaId) => {
  return await Canton.findAll({
    where: { provincia_id: provinciaId },
    include: [{ model: Provincia, as: 'provincia' }],
    order: [['nombre', 'ASC']],
  });
};

const create = async (data) => {
  if (!data.nombre) {
    throw new Error('El nombre del cantón es requerido');
  }
  if (!data.provincia_id) {
    throw new Error('La provincia es requerida');
  }
  return await Canton.create(data);
};

const update = async (id, data) => {
  const canton = await Canton.findByPk(id);
  if (!canton) {
    throw new Error('Cantón no encontrado');
  }
  return await canton.update(data);
};

const remove = async (id) => {
  const canton = await Canton.findByPk(id);
  if (!canton) {
    throw new Error('Cantón no encontrado');
  }
  await canton.destroy();
  return true;
};

module.exports = { findAll, findById, findByProvincia, create, update, remove };
