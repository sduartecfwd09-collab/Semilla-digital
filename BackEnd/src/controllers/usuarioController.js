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
    return res.status(400).json({ success: false, message: error.message });
  }
};

const update = async (req, res) => {
  try {
    const data = await usuarioService.update(req.params.id, req.body);
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

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email y contraseña son requeridos" });
    }

    // Delega la validación de credenciales al service
    const usuario = await usuarioService.validatePassword(email, password);

    // Genera el token JWT
    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, role: usuario.role },
      JWT_SECRET,
      { expiresIn: "8h" },
    );

    return res.status(200).json({
      success: true,
      data: {
        token,
        usuario: {
          id: usuario.id,
          name: usuario.name,
          nombre: usuario.nombre,
          email: usuario.email,
          role: usuario.role,
          status: usuario.status,
          avatar: usuario.avatar,
        },
      },
    });
  } catch (error) {
    // Errores de credenciales inválidas (lanzados por el service)
    if (
      error.message.includes("Credenciales") ||
      error.message.includes("no encontrad") ||
      error.message.includes("inválid")
    ) {
      return res.status(401).json({ success: false, message: error.message });
    }
    return res
      .status(500)
      .json({ success: false, message: "Error interno del servidor" });
  }
};

const register = async (req, res) => {
  try {
    const data = await usuarioService.register(req.body);

    // Genera token automáticamente al registrarse
    const token = jwt.sign(
      { id: data.id, email: data.email, role: data.role },
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
          role: data.role,
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

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
  changeStatus,
  login,
  register,
  getProfile,
};
