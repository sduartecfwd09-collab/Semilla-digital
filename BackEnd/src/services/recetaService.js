// ============================================================
// Service: Receta
// Descripción: Lógica de negocio para recetas de cocina
// ============================================================
const { Receta, Producto, RecetaIngrediente } = require('../models');

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
  if (!data.ingredients || (Array.isArray(data.ingredients) && data.ingredients.length === 0)) {
    throw new Error('Los ingredientes son requeridos');
  }
  if (!data.steps || (Array.isArray(data.steps) && data.steps.length === 0)) {
    throw new Error('Las instrucciones son requeridas');
  }
  if (!data.difficulty) {
    throw new Error('La dificultad es requerida');
  }
  if (!data.time) {
    throw new Error('El tiempo de preparación es requerido');
  }

  let ingredients = data.ingredients;
  if (typeof ingredients === 'string') {
    ingredients = ingredients.split(',').map(i => i.trim()).filter(Boolean);
  }

  let steps = data.steps;
  if (typeof steps === 'string') {
    steps = steps.split('\n').map(s => s.trim()).filter(Boolean);
  }

  let time = String(data.time).trim();
  if (time && !time.endsWith('min')) {
    time = `${time} min`;
  }

  return await Receta.create({
    ...data,
    ingredients,
    steps,
    time
  });
};

const update = async (id, data) => {
  const receta = await Receta.findByPk(id);
  if (!receta) {
    throw new Error('Receta no encontrada');
  }

  const processed = {};
  if (data.ingredients !== undefined) {
    processed.ingredients = typeof data.ingredients === 'string'
      ? data.ingredients.split(',').map(i => i.trim()).filter(Boolean)
      : data.ingredients;
  }
  if (data.steps !== undefined) {
    processed.steps = typeof data.steps === 'string'
      ? data.steps.split('\n').map(s => s.trim()).filter(Boolean)
      : data.steps;
  }
  if (data.time !== undefined) {
    let time = String(data.time).trim();
    if (time && !time.endsWith('min')) {
      time = `${time} min`;
    }
    processed.time = time;
  }

  return await receta.update({
    ...data,
    ...processed
  });
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
