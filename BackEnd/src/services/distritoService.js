// ============================================================
// Service: Distrito
// Descripción: Lógica de negocio para distritos
// ============================================================
const { Distrito, Canton, Provincia } = require('../models');

const findAll = async () => {
  return await Distrito.findAll({
    include: [{
      model: Canton,
      as: 'canton',
      include: [{ model: Provincia, as: 'provincia' }],
    }],
    order: [['nombre', 'ASC']],
  });
};

const findById = async (id) => {
  return await Distrito.findByPk(id, {
    include: [{
      model: Canton,
      as: 'canton',
      include: [{ model: Provincia, as: 'provincia' }],
    }],
  });
};

const findByCanton = async (cantonId) => {
  return await Distrito.findAll({
    where: { canton_id: cantonId },
    order: [['nombre', 'ASC']],
  });
};

const create = async (data) => {
  if (!data.nombre) {
    throw new Error('El nombre del distrito es requerido');
  }
  if (!data.canton_id) {
    throw new Error('El cantón es requerido');
  }
  return await Distrito.create(data);
};

const update = async (id, data) => {
  const distrito = await Distrito.findByPk(id);
  if (!distrito) {
    throw new Error('Distrito no encontrado');
  }
  return await distrito.update(data);
};

const remove = async (id) => {
  const distrito = await Distrito.findByPk(id);
  if (!distrito) {
    throw new Error('Distrito no encontrado');
  }
  await distrito.destroy();
  return true;
};

module.exports = { findAll, findById, findByCanton, create, update, remove };
