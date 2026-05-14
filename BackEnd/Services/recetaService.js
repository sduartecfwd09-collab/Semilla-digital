// ============================================================
// Service: Receta
// Descripción: Lógica de negocio para recetas de cocina
// ============================================================
const { Receta, Producto, RecetaIngrediente } = require('../Models');

const findAll = async (query = {}) => {
  const where = {};

  // Filtro por dificultad
  if (query.difficulty) {
    where.difficulty = query.difficulty;
  }

  return await Receta.findAll({
    where,
    include: [{
      model: Producto,
      as: 'productosIngredientes',
      through: { attributes: ['cantidad', 'unidad'] },
    }],
    order: [['created_at', 'DESC']],
  });
};

const findById = async (id) => {
  return await Receta.findByPk(id, {
    include: [{
      model: Producto,
      as: 'productosIngredientes',
      through: { attributes: ['cantidad', 'unidad'] },
    }],
  });
};

const findByProducto = async (productoId) => {
  // Busca recetas que contengan un producto específico como ingrediente
  const ingredientes = await RecetaIngrediente.findAll({
    where: { producto_id: productoId },
    attributes: ['receta_id'],
  });

  const recetaIds = ingredientes.map((i) => i.receta_id);

  if (recetaIds.length === 0) return [];

  return await Receta.findAll({
    where: { id: recetaIds },
    include: [{
      model: Producto,
      as: 'productosIngredientes',
      through: { attributes: ['cantidad', 'unidad'] },
    }],
  });
};

const create = async (data) => {
  if (!data.title) {
    throw new Error('El título de la receta es requerido');
  }
  return await Receta.create(data);
};

const update = async (id, data) => {
  const receta = await Receta.findByPk(id);
  if (!receta) {
    throw new Error('Receta no encontrada');
  }
  return await receta.update(data);
};

const remove = async (id) => {
  const receta = await Receta.findByPk(id);
  if (!receta) {
    throw new Error('Receta no encontrada');
  }
  await receta.destroy();
  return true;
};

module.exports = { findAll, findById, findByProducto, create, update, remove };
