'use strict';
const { Producto, Precio, Feria } = require('../models');

const formatValidationErrors = (error) => {
  if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
    return error.errors.map((e) => e.message).join(' | ');
  }
  return error.message;
};

// Helper: incluir precios en la consulta
const includePrecios = {
  model: Precio,
  as: 'precios',
  attributes: ['id', 'feriaId', 'feriaNombre', 'provincia', 'precio'],
};

// GET /productos  o  GET /productos?userId=X
const getAll = async (req, res) => {
  try {
    const where = {};
    if (req.query.userId) {
      where.userId = req.query.userId;
    }

    const productos = await Producto.findAll({
      where,
      include: [includePrecios],
      order: [['createdAt', 'DESC']],
    });

    // Formatear precio como número para compatibilidad con frontend
    const formatted = productos.map((p) => {
      const plain = p.toJSON();
      plain.precios = plain.precios.map((pr) => ({
        ...pr,
        precio: parseFloat(pr.precio),
      }));
      return plain;
    });

    return res.json(formatted);
  } catch (error) {
    console.error('[Producto] getAll:', error);
    return res.status(500).json({ error: 'Error al obtener los productos.' });
  }
};

// GET /productos/:id
const getById = async (req, res) => {
  try {
    const producto = await Producto.findByPk(req.params.id, {
      include: [includePrecios],
    });
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado.' });

    const plain = producto.toJSON();
    plain.precios = plain.precios.map((pr) => ({ ...pr, precio: parseFloat(pr.precio) }));
    return res.json(plain);
  } catch (error) {
    console.error('[Producto] getById:', error);
    return res.status(500).json({ error: 'Error al obtener el producto.' });
  }
};

// POST /productos
// Body: {userId, nombre, emoji, descripcion, categoria, imagen, disponible, unidad, provincia, direccionPuesto, precios:[{feriaId, feriaNombre, provincia, precio}]}
const create = async (req, res) => {
  try {
    const {
      userId, nombre, emoji, descripcion, categoria,
      imagen, disponible, unidad, provincia, direccionPuesto, precios,
    } = req.body;

    if (!userId || !nombre) {
      return res.status(400).json({ error: 'Los campos userId y nombre son obligatorios.' });
    }

    const producto = await Producto.create({
      userId,
      nombre: nombre.trim(),
      emoji: emoji || '📦',
      descripcion: descripcion?.trim() || '',
      categoria: categoria || 'Otros',
      imagen: imagen || '',
      disponible: disponible !== undefined ? disponible : true,
      unidad: unidad || 'Kilogramo',
      provincia: provincia || '',
      direccionPuesto: direccionPuesto?.trim() || '',
    });

    // Guardar precios asociados
    if (Array.isArray(precios) && precios.length > 0) {
      await Promise.all(
        precios.map((p) =>
          Precio.create({
            productoId: producto.id,
            feriaId: p.feriaId || null,
            feriaNombre: p.feriaNombre || '',
            provincia: p.provincia || '',
            precio: parseFloat(p.precio) || 0,
          })
        )
      );
    }

    // Devolver producto con precios
    const result = await Producto.findByPk(producto.id, { include: [includePrecios] });
    const plain = result.toJSON();
    plain.precios = plain.precios.map((pr) => ({ ...pr, precio: parseFloat(pr.precio) }));
    return res.status(201).json(plain);
  } catch (error) {
    console.error('[Producto] create:', error);
    return res.status(400).json({ error: formatValidationErrors(error) });
  }
};

// PUT /productos/:id  (reemplazo completo, incluye actualizar precios)
const update = async (req, res) => {
  try {
    const producto = await Producto.findByPk(req.params.id, { include: [includePrecios] });
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado.' });

    const {
      nombre, emoji, descripcion, categoria,
      imagen, disponible, unidad, provincia, direccionPuesto, precios,
    } = req.body;

    await producto.update({
      nombre: nombre ? nombre.trim() : producto.nombre,
      emoji: emoji || producto.emoji,
      descripcion: descripcion !== undefined ? descripcion.trim() : producto.descripcion,
      categoria: categoria || producto.categoria,
      imagen: imagen !== undefined ? imagen : producto.imagen,
      disponible: disponible !== undefined ? disponible : producto.disponible,
      unidad: unidad || producto.unidad,
      provincia: provincia !== undefined ? provincia : producto.provincia,
      direccionPuesto: direccionPuesto !== undefined ? direccionPuesto.trim() : producto.direccionPuesto,
    });

    // Reemplazar precios si se envían
    if (Array.isArray(precios)) {
      await Precio.destroy({ where: { productoId: producto.id } });
      if (precios.length > 0) {
        await Promise.all(
          precios.map((p) =>
            Precio.create({
              productoId: producto.id,
              feriaId: p.feriaId || null,
              feriaNombre: p.feriaNombre || '',
              provincia: p.provincia || '',
              precio: parseFloat(p.precio) || 0,
            })
          )
        );
      }
    }

    const result = await Producto.findByPk(producto.id, { include: [includePrecios] });
    const plain = result.toJSON();
    plain.precios = plain.precios.map((pr) => ({ ...pr, precio: parseFloat(pr.precio) }));
    return res.json(plain);
  } catch (error) {
    console.error('[Producto] update:', error);
    return res.status(400).json({ error: formatValidationErrors(error) });
  }
};

// PATCH /productos/:id  (actualización parcial — disponible, etc.)
const patch = async (req, res) => {
  try {
    const producto = await Producto.findByPk(req.params.id, { include: [includePrecios] });
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado.' });

    const { precios, ...rest } = req.body;
    await producto.update(rest);

    if (Array.isArray(precios)) {
      await Precio.destroy({ where: { productoId: producto.id } });
      if (precios.length > 0) {
        await Promise.all(
          precios.map((p) =>
            Precio.create({
              productoId: producto.id,
              feriaId: p.feriaId || null,
              feriaNombre: p.feriaNombre || '',
              provincia: p.provincia || '',
              precio: parseFloat(p.precio) || 0,
            })
          )
        );
      }
    }

    const result = await Producto.findByPk(producto.id, { include: [includePrecios] });
    const plain = result.toJSON();
    plain.precios = plain.precios.map((pr) => ({ ...pr, precio: parseFloat(pr.precio) }));
    return res.json(plain);
  } catch (error) {
    console.error('[Producto] patch:', error);
    return res.status(400).json({ error: formatValidationErrors(error) });
  }
};

// DELETE /productos/:id
const remove = async (req, res) => {
  try {
    const producto = await Producto.findByPk(req.params.id);
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado.' });
    await producto.destroy(); // CASCADE elimina precios
    return res.json({ message: 'Producto eliminado correctamente.' });
  } catch (error) {
    console.error('[Producto] remove:', error);
    return res.status(500).json({ error: 'Error al eliminar el producto.' });
  }
};

module.exports = { getAll, getById, create, update, patch, remove };
