// ============================================================
// Service: Provincia
// Descripción: Lógica de negocio para provincias
// ============================================================
const { Provincia } = require('../Models');

const findAll = async () => {
  return await Provincia.findAll({
    order: [['nombre', 'ASC']],
  });
};

const findById = async (id) => {
  return await Provincia.findByPk(id);
};

const create = async (data) => {
  if (!data.nombre) {
    throw new Error('El nombre de la provincia es requerido');
  }
  return await Provincia.create(data);
};

const update = async (id, data) => {
  const provincia = await Provincia.findByPk(id);
  if (!provincia) {
    throw new Error('Provincia no encontrada');
  }
  return await provincia.update(data);
};

const remove = async (id) => {
  const provincia = await Provincia.findByPk(id);
  if (!provincia) {
    throw new Error('Provincia no encontrada');
  }
  await provincia.destroy();
  return true;
};

module.exports = { findAll, findById, create, update, remove };
