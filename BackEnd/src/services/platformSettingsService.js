const { PlatformSetting } = require('../models');

const DEFAULTS = {
  comision_porcentaje: '10',
};

const getSetting = async (clave) => {
  const row = await PlatformSetting.findOne({ where: { clave } });
  return row ? row.valor : (DEFAULTS[clave] ?? null);
};

const getComisionActual = async () => {
  const val = await getSetting('comision_porcentaje');
  return parseFloat(val) || 0;
};

const setSetting = async (clave, valor, descripcion) => {
  const [row, created] = await PlatformSetting.findOrCreate({
    where: { clave },
    defaults: { valor, descripcion: descripcion || null },
  });
  if (!created) {
    await row.update({ valor, ...(descripcion !== undefined ? { descripcion } : {}) });
  }
  return row;
};

const getAllSettings = async () => {
  return PlatformSetting.findAll({ order: [['clave', 'ASC']] });
};

module.exports = { getSetting, getComisionActual, setSetting, getAllSettings };
