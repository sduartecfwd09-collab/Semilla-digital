// ============================================================
// Service: Receta
// Descripción: Lógica de negocio para recetas de cocina
// ============================================================
const { Receta, Producto, RecetaIngrediente } = require('../models');

const getRecipeTitle = (data) =>
  String(data.title ?? data.titulo ?? data.nombre ?? data.name ?? '').trim();

const getRecipeImageUrl = (data) =>
  String(data.image_url ?? data.imageUrl ?? data.imagen ?? '').trim();

const validateRecipeImageUrl = (imageUrl) => {
  if (!imageUrl) return null;
  const isCloudinaryUrl = /^https:\/\/res\.cloudinary\.com\//.test(imageUrl);
  const isLocalFallback = /^\/storage\/cloudinary-fallback\//.test(imageUrl)
    || /^https?:\/\/[^/]+\/storage\/cloudinary-fallback\//.test(imageUrl);
  if (!isCloudinaryUrl && !isLocalFallback) {
    throw new Error('La imagen de la receta debe subirse desde el formulario');
  }
  return imageUrl;
};

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
  const title = getRecipeTitle(data);
  if (!title) {
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
    title,
    description: data.description,
    image_url: validateRecipeImageUrl(getRecipeImageUrl(data)),
    difficulty: data.difficulty,
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

  const allowed = {};
  ['description', 'difficulty'].forEach((field) => {
    if (data[field] !== undefined) allowed[field] = data[field];
  });
  const title = getRecipeTitle(data);
  if (title) allowed.title = title;
  const imageUrl = getRecipeImageUrl(data);
  if (imageUrl || data.image_url === '' || data.imageUrl === '' || data.imagen === '') {
    allowed.image_url = validateRecipeImageUrl(imageUrl);
  }

  return await receta.update({ ...allowed, ...processed });
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
