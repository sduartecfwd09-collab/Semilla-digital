// ============================================================
// Controller: Productor
// Descripción: Endpoints específicos del productor autenticado.
// ============================================================
const productorService = require('../services/productorService');

// GET /productores/me/ferias
// Devuelve solo las ferias donde el productor logueado está autorizado a vender.
// Usuario sin puesto → [] (no es error: simplemente todavía no tiene ferias).
const getMisFerias = async (req, res) => {
  try {
    const data = await productorService.findMisFerias(req.user.id);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('[ProductorController.getMisFerias]', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

module.exports = { getMisFerias };
