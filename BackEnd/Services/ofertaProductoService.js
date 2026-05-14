// ============================================================
// Service: OfertaProducto
// Descripción: Lógica de negocio para ofertas de productos
//              en ferias (tabla intermedia con datos extra)
// ============================================================
const { OfertaProducto, Producto, Feria, Usuario } = require('../Models');

const findAll = async (query = {}) => {
  return await OfertaProducto.findAll({
    include: [
      {
        model: Producto,
        as: 'producto',
        include: [{ model: Usuario, as: 'usuario', attributes: ['id', 'name', 'nombre'] }],
      },
      { model: Feria, as: 'feria' },
    ],
    order: [['created_at', 'DESC']],
  });
};

const findById = async (id) => {
  return await OfertaProducto.findByPk(id, {
    include: [
      { model: Producto, as: 'producto' },
      { model: Feria, as: 'feria' },
    ],
  });
};

const findByFeria = async (feriaId) => {
  return await OfertaProducto.findAll({
    where: { feria_id: feriaId },
    include: [
      {
        model: Producto,
        as: 'producto',
        include: [{ model: Usuario, as: 'usuario', attributes: ['id', 'name', 'nombre'] }],
      },
    ],
    order: [['created_at', 'DESC']],
  });
};

const findByProducto = async (productoId) => {
  return await OfertaProducto.findAll({
    where: { producto_id: productoId },
    include: [{ model: Feria, as: 'feria' }],
  });
};

const create = async (data) => {
  if (!data.producto_id) {
    throw new Error('El producto es requerido');
  }
  if (!data.feria_id) {
    throw new Error('La feria es requerida');
  }
  if (data.precio === undefined || data.precio === null) {
    throw new Error('El precio es requerido');
  }
  return await OfertaProducto.create(data);
};

const update = async (id, data) => {
  const oferta = await OfertaProducto.findByPk(id);
  if (!oferta) {
    throw new Error('Oferta no encontrada');
  }
  return await oferta.update(data);
};

const remove = async (id) => {
  const oferta = await OfertaProducto.findByPk(id);
  if (!oferta) {
    throw new Error('Oferta no encontrada');
  }
  await oferta.destroy();
  return true;
};

module.exports = { findAll, findById, findByFeria, findByProducto, create, update, remove };
