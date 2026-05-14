'use strict';
const { Receta } = require('../models');

const formatValidationErrors = (error) => {
  if (error.name === 'SequelizeValidationError') {
    return error.errors.map((e) => e.message).join(' | ');
  }
  return error.message;
};

// GET /recetas
const getAll = async (req, res) => {
  try {
    const recetas = await Receta.findAll({ order: [['createdAt', 'DESC']] });
    return res.json(recetas);
  } catch (error) {
    console.error('[Receta] getAll:', error);
    return res.status(500).json({ error: 'Error al obtener las recetas.' });
  }
};

// GET /recetas/:id
const getById = async (req, res) => {
  try {
    const receta = await Receta.findByPk(req.params.id);
    if (!receta) return res.status(404).json({ error: 'Receta no encontrada.' });
    return res.json(receta);
  } catch (error) {
    console.error('[Receta] getById:', error);
    return res.status(500).json({ error: 'Error al obtener la receta.' });
  }
};

// POST /recetas
// Body: {title, description, ingredients:[], steps:[], difficulty, time}
const create = async (req, res) => {
  try {
    const { title, description, ingredients, steps, difficulty, time } = req.body;

    if (!title || !description || !ingredients || !steps || !time) {
      return res.status(400).json({
        error: 'Los campos title, description, ingredients, steps y time son obligatorios.',
      });
    }

    // El frontend puede enviar ingredients como string "ingrediente1, ingrediente2"
    const ingredientsArray = Array.isArray(ingredients)
      ? ingredients
      : ingredients.split(',').map((i) => i.trim()).filter(Boolean);

    // steps puede ser string con saltos de línea
    const stepsArray = Array.isArray(steps)
      ? steps
      : steps.split('\n').map((s) => s.trim()).filter(Boolean);

    const receta = await Receta.create({
      title: title.trim(),
      description: description.trim(),
      ingredients: ingredientsArray,
      steps: stepsArray,
      difficulty: difficulty || 'Fácil',
      time: time.includes('min') ? time.trim() : `${time.trim()} min`,
    });

    return res.status(201).json(receta);
  } catch (error) {
    console.error('[Receta] create:', error);
    return res.status(400).json({ error: formatValidationErrors(error) });
  }
};

// PUT /recetas/:id
const update = async (req, res) => {
  try {
    const receta = await Receta.findByPk(req.params.id);
    if (!receta) return res.status(404).json({ error: 'Receta no encontrada.' });

    const { title, description, ingredients, steps, difficulty, time } = req.body;

    const ingredientsArray = ingredients
      ? (Array.isArray(ingredients)
        ? ingredients
        : ingredients.split(',').map((i) => i.trim()).filter(Boolean))
      : receta.ingredients;

    const stepsArray = steps
      ? (Array.isArray(steps)
        ? steps
        : steps.split('\n').map((s) => s.trim()).filter(Boolean))
      : receta.steps;

    await receta.update({
      title: title ? title.trim() : receta.title,
      description: description ? description.trim() : receta.description,
      ingredients: ingredientsArray,
      steps: stepsArray,
      difficulty: difficulty || receta.difficulty,
      time: time
        ? (time.includes('min') ? time.trim() : `${time.trim()} min`)
        : receta.time,
    });

    return res.json(receta);
  } catch (error) {
    console.error('[Receta] update:', error);
    return res.status(400).json({ error: formatValidationErrors(error) });
  }
};

// DELETE /recetas/:id
const remove = async (req, res) => {
  try {
    const receta = await Receta.findByPk(req.params.id);
    if (!receta) return res.status(404).json({ error: 'Receta no encontrada.' });
    await receta.destroy();
    return res.json({ message: 'Receta eliminada correctamente.' });
  } catch (error) {
    console.error('[Receta] remove:', error);
    return res.status(500).json({ error: 'Error al eliminar la receta.' });
  }
};

module.exports = { getAll, getById, create, update, remove };
