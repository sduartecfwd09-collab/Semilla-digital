// ============================================================
// Service: Producto
// Descripción: Lógica de negocio para productos agrícolas
// ============================================================
const { Producto, Usuario } = require('../Models');

const findAll = async (query = {}) => {
  const where = {};

  // Filtro por categoría
  if (query.categoria) {
    where.categoria = query.categoria;
  }

  // Filtro por disponibilidad
  if (query.disponible !== undefined) {
    where.disponible = query.disponible === 'true' || query.disponible === true;
  }

  return await Producto.findAll({
    where,
    include: [{ model: Usuario, as: 'usuario', attributes: ['id', 'name', 'nombre', 'email'] }],
    order: [['created_at', 'DESC']],
  });
};

const findById = async (id) => {
  return await Producto.findByPk(id, {
    include: [{ model: Usuario, as: 'usuario', attributes: ['id', 'name', 'nombre', 'email'] }],
  });
};

const findByUser = async (userId) => {
  return await Producto.findAll({
    where: { user_id: userId },
    order: [['nombre', 'ASC']],
  });
};

const findByCategoria = async (categoria) => {
  return await Producto.findAll({
    where: { categoria },
    include: [{ model: Usuario, as: 'usuario', attributes: ['id', 'name', 'nombre', 'email'] }],
    order: [['nombre', 'ASC']],
  });
};

const create = async (data) => {
  if (!data.nombre) {
    throw new Error('El nombre del producto es requerido');
  }
  if (!data.user_id) {
    throw new Error('El usuario (agricultor) es requerido');
  }
  return await Producto.create(data);
};

const update = async (id, data) => {
  const producto = await Producto.findByPk(id);
  if (!producto) {
    throw new Error('Producto no encontrado');
  }
  return await producto.update(data);
};

const toggleDisponible = async (id) => {
  const producto = await Producto.findByPk(id);
  if (!producto) {
    throw new Error('Producto no encontrado');
  }
  return await producto.update({ disponible: !producto.disponible });
};

const remove = async (id) => {
  const producto = await Producto.findByPk(id);
  if (!producto) {
    throw new Error('Producto no encontrado');
  }
  await producto.destroy();
  return true;
};

module.exports = {
  findAll,
  findById,
  findByUser,
  findByCategoria,
  create,
  update,
  toggleDisponible,
  remove,
};
