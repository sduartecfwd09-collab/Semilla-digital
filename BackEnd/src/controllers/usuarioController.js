// ============================================================
// Controller: Usuario
// Descripción: Orquesta las peticiones HTTP para usuarios
//              Incluye login con JWT
// ============================================================
const jwt = require("jsonwebtoken");
const usuarioService = require("../services/usuarioService");

const JWT_SECRET = process.env.JWT_SECRET;

// ── CRUD ────────────────────────────────────────────────────

const getAll = async (req, res) => {
  try {
    const data = await usuarioService.findAll();
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Error interno del servidor" });
  }
};

const getById = async (req, res) => {
  try {
    const data = await usuarioService.findById(req.params.id);
    if (!data) {
      return res
        .status(404)
        .json({ success: false, message: "Usuario no encontrado" });
    }
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Error interno del servidor" });
  }
};

const create = async (req, res) => {
  try {
    const data = await usuarioService.create(req.body);
    return res.status(201).json({ success: true, data });
  } catch (error) {
    if (error.message.includes("Ya existe")) {
      return res.status(409).json({ success: false, message: error.message });
    }
    return res.status(400).json({ success: false, message: error.message });
  }
};

const update = async (req, res) => {
  try {
    // Si el solicitante no es admin, filtramos los campos sensibles del payload
    // para evitar auto-elevación de privilegios o cambios de estado por la puerta trasera.
    const payload = { ...req.body };
    if (req.user?.role !== 'Administrador') {
      delete payload.role;
      delete payload.roleId;
      delete payload.status;
    }
    const data = await usuarioService.update(req.params.id, payload);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    if (error.message.includes("no encontrad")) {
      return res.status(404).json({ success: false, message: error.message });
    }
    return res.status(400).json({ success: false, message: error.message });
  }
};

const remove = async (req, res) => {
  try {
    await usuarioService.remove(req.params.id);
    return res
      .status(200)
      .json({
        success: true,
        data: { message: "Usuario eliminado correctamente" },
      });
  } catch (error) {
    if (error.message.includes("no encontrado")) {
      return res.status(404).json({ success: false, message: error.message });
    }
    return res
      .status(500)
      .json({ success: false, message: "Error interno del servidor" });
  }
};

const changeStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res
        .status(400)
        .json({ success: false, message: "El status es requerido" });
    }
    const data = await usuarioService.changeStatus(req.params.id, status);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    if (error.message.includes("no encontrad")) {
      return res.status(404).json({ success: false, message: error.message });
    }
    return res.status(400).json({ success: false, message: error.message });
  }
};

// ── AUTH ─────────────────────────────────────────────────────


const register = async (req, res) => {
  try {
    const data = await usuarioService.register(req.body);

    // `data.role` viene como string (lo que se le pasó al crear) o undefined.
    // Si no llegó, intentamos derivarlo desde el usuario recién creado.
    let roleName = data.role || null;
    if (!roleName && data.id) {
      const full = await usuarioService.findById(data.id);
      roleName = full?.rol?.nombre || null;
    }

    // Genera token automáticamente al registrarse
    const token = jwt.sign(
      { id: data.id, email: data.email, role: roleName },
      JWT_SECRET,
      { expiresIn: "8h" },
    );

    return res.status(201).json({
      success: true,
      data: {
        token,
        usuario: {
          id: data.id,
          name: data.name,
          nombre: data.nombre,
          email: data.email,
          role: roleName,
          status: data.status,
        },
      },
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const getProfile = async (req, res) => {
  try {
    // req.user viene del middleware de autenticación
    const data = await usuarioService.findById(req.user.id);
    if (!data) {
      return res
        .status(404)
        .json({ success: false, message: "Usuario no encontrado" });
    }
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Error interno del servidor" });
  }
};

const changePassword = async (req, res) => {
  try {
    const targetId = String(req.params.id);
    const requesterId = String(req.user?.id);
    const requesterRole = req.user?.role;

    if (targetId !== requesterId && requesterRole !== 'Administrador') {
      return res
        .status(403)
        .json({ success: false, message: 'No tenés permiso para cambiar esta contraseña' });
    }

    const { currentPassword, newPassword } = req.body;
    await usuarioService.changePassword(targetId, currentPassword, newPassword);
    return res.status(200).json({ success: true, message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    if (error.message.includes('no encontrado')) {
      return res.status(404).json({ success: false, message: error.message });
    }
    if (error.message.includes('actual no es correcta')) {
      return res.status(401).json({ success: false, message: error.message });
    }
    return res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
  changeStatus,

  register,
  getProfile,
  changePassword,
};
