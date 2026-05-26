const { sequelize, Proforma, ProformaItem, ProducerEarning, OfertaProducto, Producto, Usuario, Direccion } = require('../models');
const platformSettingsService = require('./platformSettingsService');
const notificacionService = require('./notificacionService');

const includeRelations = [
  { model: Usuario, as: 'usuario', attributes: ['id', 'name', 'nombre', 'email'] },
  { model: Direccion, as: 'direccion' },
  {
    model: ProformaItem,
    as: 'proformaItems',
    include: [
      { model: Producto, as: 'producto', attributes: ['id', 'nombre', 'emoji'] },
    ],
  },
];

const findAll = async () => {
  return Proforma.findAll({
    include: includeRelations,
    order: [['fecha', 'DESC']],
  });
};

const findById = async (id) => {
  return Proforma.findByPk(id, { include: includeRelations });
};

const findByUsuario = async (usuarioId) => {
  return Proforma.findAll({
    where: { usuario_id: usuarioId },
    include: [
      { model: Direccion, as: 'direccion' },
      {
        model: ProformaItem,
        as: 'proformaItems',
        include: [{ model: Producto, as: 'producto', attributes: ['id', 'nombre', 'emoji'] }],
      },
    ],
    order: [['fecha', 'DESC']],
  });
};

const create = async (data, userId) => {
  if (data.subtotal === undefined || data.subtotal === null) throw new Error('El subtotal es requerido');
  if (data.total === undefined || data.total === null) throw new Error('El total es requerido');

  const comisionPct = await platformSettingsService.getComisionActual();
  const id = `PRO-${Date.now()}`;
  const items = Array.isArray(data.items) ? data.items : [];

  const proforma = await sequelize.transaction(async (t) => {
    const nuevaProforma = await Proforma.create({
      id,
      usuario_id: userId || data.usuario_id || null,
      fecha: new Date(),
      items: data.items || null,
      subtotal: data.subtotal,
      total: data.total,
      costo_envio: data.costo_envio || 0,
      notas: data.notas || null,
      direccion_id: data.direccion_id || null,
    }, { transaction: t });

    const productorNotifs = new Map();

    for (const item of items) {
      let precio_unitario = parseFloat(item.precio) || 0;
      let producto_id = item.producto_id ? parseInt(item.producto_id) : null;
      let oferta_producto_id = item.oferta_producto_id ? parseInt(item.oferta_producto_id) : null;
      let productor_id = item.productor_id ? parseInt(item.productor_id) : null;

      // Si viene con oferta_producto_id real, validamos contra BD y usamos precio oficial
      if (oferta_producto_id) {
        const oferta = await OfertaProducto.findByPk(oferta_producto_id, {
          include: [{ model: Producto, as: 'producto', attributes: ['id', 'user_id'] }],
          transaction: t,
        });

        if (oferta) {
          precio_unitario = parseFloat(oferta.precio);
          producto_id = oferta.producto_id;

          if (oferta.producto) {
            productor_id = oferta.producto.user_id;
          }

          // Decrementar stock solo si está definido
          if (oferta.stock !== null && oferta.stock !== undefined) {
            const cantidadSolicitada = parseFloat(item.cantidad) || 1;
            if (oferta.stock < cantidadSolicitada) {
              throw new Error(`Stock insuficiente para "${item.nombre || 'producto'}": disponible ${oferta.stock}, solicitado ${cantidadSolicitada}`);
            }
            await oferta.decrement('stock', { by: cantidadSolicitada, transaction: t });
          }
        }
      }

      const cantidad = parseFloat(item.cantidad) || 1;
      const subtotal = precio_unitario * cantidad;

      const proformaItem = await ProformaItem.create({
        proforma_id: id,
        producto_id,
        oferta_producto_id,
        productor_id,
        nombre_snapshot: item.nombre || 'Producto',
        cantidad,
        precio_unitario,
        subtotal,
        unidad: item.unidad || null,
      }, { transaction: t });

      // Crear earning solo si tenemos productor identificado
      if (productor_id) {
        const monto_bruto = subtotal;
        const comision_plataforma = parseFloat((monto_bruto * comisionPct / 100).toFixed(2));
        const monto_neto = parseFloat((monto_bruto - comision_plataforma).toFixed(2));

        await ProducerEarning.create({
          productor_id,
          proforma_id: id,
          proforma_item_id: proformaItem.id,
          monto_bruto,
          comision_plataforma,
          porcentaje_comision: comisionPct,
          monto_neto,
          estado: 'Pendiente',
        }, { transaction: t });

        // Acumular para notificación post-transacción (agrupado por productor)
        if (!productorNotifs.has(productor_id)) {
          productorNotifs.set(productor_id, []);
        }
        productorNotifs.get(productor_id).push({
          nombreProducto: item.nombre || 'Producto',
          cantidad,
          montoBruto: monto_bruto,
          montoNeto: monto_neto,
          porcentajeComision: comisionPct,
        });
      }
    }

    return { proforma: nuevaProforma, productorNotifs };
  });

  // Notificar productores fuera de la transacción (fire-and-forget)
  for (const [productorId, ventas] of proforma.productorNotifs) {
    for (const venta of ventas) {
      notificacionService.notifyProductorVenta(productorId, {
        proformaId: id,
        ...venta,
      }).catch(() => {});
    }
  }

  return proforma.proforma;
};

const update = async (id, data) => {
  const proforma = await Proforma.findByPk(id);
  if (!proforma) throw new Error('Proforma no encontrada');
  return proforma.update(data);
};

const remove = async (id) => {
  const proforma = await Proforma.findByPk(id);
  if (!proforma) throw new Error('Proforma no encontrada');
  await proforma.destroy();
  return true;
};

module.exports = { findAll, findById, findByUsuario, create, update, remove };
