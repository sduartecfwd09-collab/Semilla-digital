// ============================================================
// Controller: SolicitudCambioRol
// Descripción: Orquesta las peticiones HTTP para solicitudes
//              de cambio de rol
// ============================================================
const solicitudService = require('../Services/solicitudCambioRolService');

const getAll = async (req, res) => {
  try {
    const data = await solicitudService.findAll(req.query);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

const getById = async (req, res) => {
  try {
    const data = await solicitudService.findById(req.params.id);
    if (!data) {
      return res.status(404).json({ success: false, message: 'Solicitud no encontrada' });
    }
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

const getByUsuario = async (req, res) => {
  try {
    const data = await solicitudService.findByUsuario(req.params.usuarioId);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

const create = async (req, res) => {
  try {
    const data = await solicitudService.create(req.body);
    return res.status(201).json({ success: true, data });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const approve = async (req, res) => {
  try {
    const data = await solicitudService.approve(req.params.id, req.body);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    if (error.message.includes('no encontrad')) {
      return res.status(404).json({ success: false, message: error.message });
    }
    return res.status(400).json({ success: false, message: error.message });
  }
};

const reject = async (req, res) => {
  try {
    const data = await solicitudService.reject(req.params.id, req.body);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    if (error.message.includes('no encontrad')) {
      return res.status(404).json({ success: false, message: error.message });
    }
    return res.status(400).json({ success: false, message: error.message });
  }
};

const remove = async (req, res) => {
  try {
    await solicitudService.remove(req.params.id);
    return res.status(200).json({ success: true, data: { message: 'Solicitud eliminada correctamente' } });
  } catch (error) {
    if (error.message.includes('no encontrad')) {
      return res.status(404).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

const getPendientes = async (req, res) => {
  try {
    const data = await solicitudService.findPendientes();
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

module.exports = { getAll, getById, getByUsuario, getPendientes, create, approve, reject, remove };
