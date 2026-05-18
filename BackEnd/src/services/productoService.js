// ============================================================
// Service: Producto
// Descripción: Lógica de negocio para productos agrícolas
// ============================================================
const { Producto, Usuario, OfertaProducto, Feria } = require('../models');

// Función auxiliar para mapear el resultado de la base de datos a lo que espera el frontend
const mapProductoParaFrontend = (producto) => {
  const plain = producto.get ? producto.get({ plain: true }) : producto;
  // Convertir ofertas a la estructura "precios" esperada
  if (plain.ofertas) {
    plain.precios = plain.ofertas.map(o => ({
      feriaId: o.feria_id,
      feriaNombre: o.feria ? o.feria.nombre : 'Feria',
      provincia: o.feria && o.feria.direccion && o.feria.direccion.provincia ? o.feria.direccion.provincia.nombre : (o.feria ? o.feria.provincia : ''),
      precio: parseFloat(o.precio)
    }));
    delete plain.ofertas;
  } else {
    plain.precios = [];
  }
  return plain;
};

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

  const productos = await Producto.findAll({
    where,
    include: [
      { model: Usuario, as: 'usuario', attributes: ['id', 'name', 'nombre', 'email'] },
      { model: OfertaProducto, as: 'ofertas', include: [{ model: Feria, as: 'feria' }] }
    ],
    order: [['created_at', 'DESC']],
  });
  return productos.map(mapProductoParaFrontend);
};

const findById = async (id) => {
  const producto = await Producto.findByPk(id, {
    include: [
      { model: Usuario, as: 'usuario', attributes: ['id', 'name', 'nombre', 'email'] },
      { model: OfertaProducto, as: 'ofertas', include: [{ model: Feria, as: 'feria' }] }
    ],
  });
  return producto ? mapProductoParaFrontend(producto) : null;
};

const findByUser = async (userId) => {
  const productos = await Producto.findAll({
    where: { user_id: userId },
    include: [{ model: OfertaProducto, as: 'ofertas', include: [{ model: Feria, as: 'feria' }] }],
    order: [['nombre', 'ASC']],
  });
  return productos.map(mapProductoParaFrontend);
};

const findByCategoria = async (categoria) => {
  const productos = await Producto.findAll({
    where: { categoria },
    include: [
      { model: Usuario, as: 'usuario', attributes: ['id', 'name', 'nombre', 'email'] },
      { model: OfertaProducto, as: 'ofertas', include: [{ model: Feria, as: 'feria' }] }
    ],
    order: [['nombre', 'ASC']],
  });
  return productos.map(mapProductoParaFrontend);
};

const create = async (data) => {
  const payload = { ...data };
  if (data.userId) payload.user_id = data.userId;

  if (!payload.nombre) {
    throw new Error('El nombre del producto es requerido');
  }
  if (!payload.user_id) {
    throw new Error('El usuario (agricultor) es requerido');
  }
  
  const nuevoProducto = await Producto.create(payload);

  // Guardar precios/ofertas si vienen incluidos
  if (data.precios && Array.isArray(data.precios)) {
    for (const precio of data.precios) {
      await OfertaProducto.create({
        producto_id: nuevoProducto.id,
        feria_id: precio.feriaId || 1,
        precio: precio.precio,
        unidad: data.unidad || 'Unidad'
      });
    }
  }

  return await findById(nuevoProducto.id);
};

const update = async (id, data) => {
  const producto = await Producto.findByPk(id);
  if (!producto) {
    throw new Error('Producto no encontrado');
  }

  const payload = { ...data };
  if (data.userId) payload.user_id = data.userId;

  await producto.update(payload);

  // Actualizar precios si vienen
  if (data.precios && Array.isArray(data.precios)) {
    // Borramos los viejos para reemplazarlos (simplificado)
    await OfertaProducto.destroy({ where: { producto_id: id } });
    for (const precio of data.precios) {
      await OfertaProducto.create({
        producto_id: id,
        feria_id: precio.feriaId || 1,
        precio: precio.precio,
        unidad: data.unidad || 'Unidad'
      });
    }
  }

  return await findById(id);
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
