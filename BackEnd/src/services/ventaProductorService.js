const { Op } = require('sequelize');
const { ProducerEarning, ProformaItem, Proforma, Usuario } = require('../models');

const getVentasByProductor = async (productorId, { mes, anio, limit = 50, offset = 0 } = {}) => {
  const where = { productor_id: productorId };

  const createdAtFilter = {};
  if (anio) {
    const year = parseInt(anio);
    const monthNum = mes ? parseInt(mes) : null;
    if (monthNum) {
      const start = new Date(year, monthNum - 1, 1);
      const end = new Date(year, monthNum, 1);
      createdAtFilter[Op.gte] = start;
      createdAtFilter[Op.lt] = end;
    } else {
      createdAtFilter[Op.gte] = new Date(year, 0, 1);
      createdAtFilter[Op.lt] = new Date(year + 1, 0, 1);
    }
    where.created_at = createdAtFilter;
  }

  const rows = await ProducerEarning.findAll({
    where,
    include: [
      {
        model: ProformaItem,
        as: 'proformaItem',
        attributes: ['nombre_snapshot', 'cantidad', 'precio_unitario', 'subtotal', 'unidad'],
      },
      {
        model: Proforma,
        as: 'proforma',
        attributes: ['id', 'fecha'],
      },
    ],
    order: [['created_at', 'DESC']],
    limit: parseInt(limit),
    offset: parseInt(offset),
  });

  const total = await ProducerEarning.count({ where });

  const resumen = await ProducerEarning.findOne({
    where,
    attributes: [
      [ProducerEarning.sequelize.fn('SUM', ProducerEarning.sequelize.col('monto_bruto')), 'total_bruto'],
      [ProducerEarning.sequelize.fn('SUM', ProducerEarning.sequelize.col('comision_plataforma')), 'total_comision'],
      [ProducerEarning.sequelize.fn('SUM', ProducerEarning.sequelize.col('monto_neto')), 'total_neto'],
      [ProducerEarning.sequelize.fn('SUM',
        ProducerEarning.sequelize.literal("CASE WHEN estado = 'Pendiente' THEN monto_neto ELSE 0 END")
      ), 'total_pendiente'],
    ],
    raw: true,
  });

  return {
    ventas: rows,
    total,
    resumen: {
      total_bruto: parseFloat(resumen?.total_bruto || 0),
      total_comision: parseFloat(resumen?.total_comision || 0),
      total_neto: parseFloat(resumen?.total_neto || 0),
      total_pendiente: parseFloat(resumen?.total_pendiente || 0),
    },
  };
};

const getVentasPendientesByProductor = async (productorId) => {
  return ProducerEarning.findAll({
    where: { productor_id: productorId, estado: 'Pendiente' },
    include: [
      { model: ProformaItem, as: 'proformaItem', attributes: ['nombre_snapshot', 'cantidad'] },
      { model: Proforma, as: 'proforma', attributes: ['id', 'fecha'] },
    ],
    order: [['created_at', 'DESC']],
  });
};

const getResumenPendientesGlobal = async () => {
  const rows = await ProducerEarning.findAll({
    where: { estado: 'Pendiente' },
    attributes: [
      'productor_id',
      [ProducerEarning.sequelize.fn('COUNT', ProducerEarning.sequelize.col('ProducerEarning.id')), 'num_ventas'],
      [ProducerEarning.sequelize.fn('SUM', ProducerEarning.sequelize.col('monto_neto')), 'total_pendiente'],
    ],
    include: [
      { model: Usuario, as: 'productor', attributes: ['id', 'name', 'nombre', 'email'] },
    ],
    group: ['productor_id', 'productor.id'],
    raw: false,
  });
  return rows;
};

const marcarLiquidado = async (earningId, notas) => {
  const earning = await ProducerEarning.findByPk(earningId);
  if (!earning) throw new Error('Earning no encontrado');
  if (earning.estado === 'Liquidado') throw new Error('Ya está liquidado');
  await earning.update({
    estado: 'Liquidado',
    fecha_liquidacion: new Date(),
    notas: notas || earning.notas,
  });
  return earning;
};

const liquidarBatchProductor = async (productorId, notas) => {
  const pendientes = await ProducerEarning.findAll({
    where: { productor_id: productorId, estado: 'Pendiente' },
  });
  if (!pendientes.length) throw new Error('No hay ganancias pendientes para este productor');
  const now = new Date();
  await ProducerEarning.update(
    { estado: 'Liquidado', fecha_liquidacion: now, notas: notas || null },
    { where: { productor_id: productorId, estado: 'Pendiente' } }
  );
  return pendientes.length;
};

module.exports = {
  getVentasByProductor,
  getVentasPendientesByProductor,
  getResumenPendientesGlobal,
  marcarLiquidado,
  liquidarBatchProductor,
};
