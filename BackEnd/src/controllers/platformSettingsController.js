const platformSettingsService = require('../services/platformSettingsService');

const getAll = async (req, res) => {
  try {
    const data = await platformSettingsService.getAllSettings();
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

const update = async (req, res) => {
  try {
    const { valor, descripcion } = req.body;
    if (valor === undefined) return res.status(400).json({ success: false, message: 'El campo "valor" es requerido' });
    const data = await platformSettingsService.setSetting(req.params.clave, String(valor), descripcion);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = { getAll, update };
