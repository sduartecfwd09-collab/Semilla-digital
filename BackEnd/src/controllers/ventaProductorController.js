const ventaProductorService = require('../services/ventaProductorService');

const getMisVentas = async (req, res) => {
  try {
    const productorId = req.user.id;
    const result = await ventaProductorService.getVentasByProductor(productorId, req.query);
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('[VentaProductorController.getMisVentas]', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

const getVentasByProductor = async (req, res) => {
  try {
    const result = await ventaProductorService.getVentasByProductor(req.params.productorId, req.query);
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('[VentaProductorController.getVentasByProductor]', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

module.exports = { getMisVentas, getVentasByProductor };
