// ============================================================
// Service: Producto
// Descripción: Lógica de negocio para productos agrícolas
// ============================================================
const { sequelize, Producto, Usuario, OfertaProducto, Feria, Direccion, Provincia } = require('../models');

const feriaInclude = {
  model: Feria,
  as: 'feria',
  include: [{ model: Direccion, as: 'direccion', include: [{ model: Provincia, as: 'provincia' }] }],
};

const PROVINCIAS_CR = ['San José', 'Alajuela', 'Cartago', 'Heredia', 'Guanacaste', 'Puntarenas', 'Limón'];

const derivarProvincia = (nombreFeria) => {
  if (!nombreFeria) return '';
  return PROVINCIAS_CR.find(p => nombreFeria.includes(p)) || '';
};

// Función auxiliar para mapear el resultado de la base de datos a lo que espera el frontend
const mapProductoParaFrontend = (producto) => {
  const plain = producto.get ? producto.get({ plain: true }) : producto;
  // Convertir ofertas a la estructura "precios" esperada
  if (plain.ofertas) {
    plain.precios = plain.ofertas.map(o => ({
      ofertaProductoId: o.id,
      productoId: plain.id,
      productorId: plain.user_id,
      feriaId: o.feria_id,
      feriaNombre: o.feria ? o.feria.nombre : 'Feria',
      provincia: (o.feria?.direccion?.provincia?.nombre) || derivarProvincia(o.feria?.nombre),
      precio: parseFloat(o.precio),
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

  // Filtro por usuario (productor)
  if (query.userId) {
    where.user_id = query.userId;
  }

  const hasPagination = query.page || query.limit;

  if (hasPagination) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 20;
    const offset = (page - 1) * limit;

    const list = await Producto.findAndCountAll({
      where,
      limit,
      offset,
      include: [
        { model: Usuario, as: 'usuario', attributes: ['id', 'name', 'nombre', 'email'] },
        { model: OfertaProducto, as: 'ofertas', include: [feriaInclude] }
      ],
      order: [['created_at', 'DESC']],
    });
    return { count: list.count, rows: list.rows.map(mapProductoParaFrontend) };
  } else {
    const list = await Producto.findAll({
      where,
      include: [
        { model: Usuario, as: 'usuario', attributes: ['id', 'name', 'nombre', 'email'] },
        { model: OfertaProducto, as: 'ofertas', include: [feriaInclude] }
      ],
      order: [['created_at', 'DESC']],
    });
    return list.map(mapProductoParaFrontend);
  }
};

const findById = async (id) => {
  const producto = await Producto.findByPk(id, {
    include: [
      { model: Usuario, as: 'usuario', attributes: ['id', 'name', 'nombre', 'email'] },
      { model: OfertaProducto, as: 'ofertas', include: [feriaInclude] }
    ],
  });
  return producto ? mapProductoParaFrontend(producto) : null;
};

const findByUser = async (userId) => {
  const productos = await Producto.findAll({
    where: { user_id: userId },
    include: [{ model: OfertaProducto, as: 'ofertas', include: [feriaInclude] }],
    order: [['nombre', 'ASC']],
  });
  return productos.map(mapProductoParaFrontend);
};

const findByCategoria = async (categoria) => {
  const productos = await Producto.findAll({
    where: { categoria },
    include: [
      { model: Usuario, as: 'usuario', attributes: ['id', 'name', 'nombre', 'email'] },
      { model: OfertaProducto, as: 'ofertas', include: [feriaInclude] }
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
    throw new Error('El usuario (productor) es requerido');
  }

  // Producto + ofertas en una transacción para no dejar productos huérfanos
  // si falla la inserción de alguna oferta.
  const nuevoProducto = await sequelize.transaction(async (t) => {
    const creado = await Producto.create(payload, { transaction: t });

    if (data.precios && Array.isArray(data.precios)) {
      for (const precio of data.precios) {
        if (!precio.feriaId) {
          throw new Error('Cada precio debe incluir feriaId');
        }
        await OfertaProducto.create({
          producto_id: creado.id,
          feria_id: precio.feriaId,
          precio: precio.precio,
          unidad: data.unidad || 'Unidad'
        }, { transaction: t });
      }
    }
    return creado;
  });

  return await findById(nuevoProducto.id);
};

const update = async (id, data) => {
  const producto = await Producto.findByPk(id);
  if (!producto) {
    throw new Error('Producto no encontrado');
  }

  const payload = { ...data };
  if (data.userId) payload.user_id = data.userId;

  // Si hay reemplazo de precios, envolvemos producto + ofertas en una transacción
  // para que un fallo a mitad no deje el producto sin precios.
  if (data.precios && Array.isArray(data.precios)) {
    await sequelize.transaction(async (t) => {
      await producto.update(payload, { transaction: t });
      await OfertaProducto.destroy({ where: { producto_id: id }, transaction: t });
      for (const precio of data.precios) {
        if (!precio.feriaId) {
          throw new Error('Cada precio debe incluir feriaId');
        }
        await OfertaProducto.create({
          producto_id: id,
          feria_id: precio.feriaId,
          precio: precio.precio,
          unidad: data.unidad || 'Unidad'
        }, { transaction: t });
      }
    });
  } else {
    // Sin reemplazo de precios: update simple
    await producto.update(payload);
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
