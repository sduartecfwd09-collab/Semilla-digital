// ============================================================
// Service: Proforma
// Descripción: Lógica de negocio para proformas (cotizaciones)
//              Genera el ID con formato PRO-<timestamp>
// ============================================================
const { Proforma, Usuario, Direccion } = require('../Models');

const includeRelations = [
  { model: Usuario, as: 'usuario', attributes: ['id', 'name', 'nombre', 'email'] },
  { model: Direccion, as: 'direccion' },
];

const findAll = async (query = {}) => {
  return await Proforma.findAll({
    include: includeRelations,
    order: [['fecha', 'DESC']],
  });
};

const findById = async (id) => {
  return await Proforma.findByPk(id, {
    include: includeRelations,
  });
};

const findByUsuario = async (usuarioId) => {
  return await Proforma.findAll({
    where: { usuario_id: usuarioId },
    include: [{ model: Direccion, as: 'direccion' }],
    order: [['fecha', 'DESC']],
  });
};

const create = async (data) => {
  if (data.subtotal === undefined || data.subtotal === null) {
    throw new Error('El subtotal es requerido');
  }
  if (data.total === undefined || data.total === null) {
    throw new Error('El total es requerido');
  }

  // Generar el ID con formato PRO-<timestamp>
  const id = `PRO-${Date.now()}`;

  return await Proforma.create({
    ...data,
    id,
    fecha: new Date(),
  });
};

const update = async (id, data) => {
  const proforma = await Proforma.findByPk(id);
  if (!proforma) {
    throw new Error('Proforma no encontrada');
  }
  return await proforma.update(data);
};

const remove = async (id) => {
  const proforma = await Proforma.findByPk(id);
  if (!proforma) {
    throw new Error('Proforma no encontrada');
  }
  await proforma.destroy();
  return true;
};

module.exports = { findAll, findById, findByUsuario, create, update, remove };
