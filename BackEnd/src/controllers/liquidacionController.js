const ventaProductorService = require('../services/ventaProductorService');

const getPendientes = async (req, res) => {
  try {
    const data = await ventaProductorService.getResumenPendientesGlobal();
    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('[LiquidacionController.getPendientes]', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

const marcarLiquidado = async (req, res) => {
  try {
    const data = await ventaProductorService.marcarLiquidado(req.params.id, req.body.notas);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    if (error.message.includes('no encontrad') || error.message.includes('Ya está')) {
      return res.status(400).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

const liquidarBatch = async (req, res) => {
  try {
    const count = await ventaProductorService.liquidarBatchProductor(req.params.productorId, req.body.notas);
    return res.status(200).json({ success: true, data: { liquidadas: count } });
  } catch (error) {
    if (error.message.includes('No hay')) {
      return res.status(400).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

module.exports = { getPendientes, marcarLiquidado, liquidarBatch };
