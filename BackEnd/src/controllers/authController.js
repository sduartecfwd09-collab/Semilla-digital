'use strict';
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { Usuario, Role } = require('../models');
const { Op } = require('sequelize');
const permisoService = require('../services/permisoService');
const { sendMail } = require('../services/emailService');


const JWT_SECRET  = process.env.JWT_SECRET;
const JWT_EXPIRES = process.env.JWT_EXPIRES_IN || '8h';
const RESET_PASSWORD_EXPIRES = '5m';

const passwordResetFingerprint = (passwordHash) =>
  crypto.createHash('sha256').update(String(passwordHash || '')).digest('hex');

// Helper: genera el token firmado
// Helper: genera el token firmado con permisos incluidos
const signToken = async (usuario, roleName) => {
  // Obtener permisos del rol para incluirlos en el JWT (optimización)
  const permisos = await permisoService.getPermisosByRoleId(usuario.roleId);
  
  return jwt.sign(
    { 
      id: usuario.id, 
      email: usuario.email, 
      role: roleName,
      roleId: usuario.roleId,
      permisos // Inyectamos el array de claves de permisos
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES }
  );
};


// Helper: usuario sin password
const safeUser = (usuario, roleName) => {
  const userJson = usuario.toJSON();
  delete userJson.password;
  return { ...userJson, role: roleName }; // Inyectamos el nombre del rol para el frontend
};

// ── POST /auth/login ──────────────────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email y contraseña son obligatorios.' });
    }

    const usuario = await Usuario.findOne({
      where: { email: email.toLowerCase().trim() },
      include: [{ model: Role, as: 'rol' }]
    });

    if (!usuario) {
      return res.status(401).json({ success: false, message: 'Credenciales incorrectas.' });
    }

    // Comparación con bcrypt
    const isMatch = await bcrypt.compare(password.trim(), usuario.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Credenciales incorrectas.' });
    }

    if (usuario.status === 'Inactivo') {
      return res.status(403).json({ success: false, message: 'Tu cuenta está inactiva. Contacta al administrador.' });
    }

    const roleName = usuario.rol ? usuario.rol.nombre : 'Usuario';
    const token = await signToken(usuario, roleName);

    // Configurar cookie httpOnly. `sameSite: 'lax'` permite el flujo
    // cross-port localhost (frontend en :5173, backend en :3002).
    // En producción con dominios distintos, ajustar a 'none' + secure: true.
    res.cookie('agromap_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 8 * 60 * 60 * 1000 // 8 horas
    });

    const responseData = { user: safeUser(usuario, roleName) };
    if (process.env.NODE_ENV === 'test') {
      responseData.token = token;
    }

    return res.json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    console.error('[AuthController.login]', error);
    return res.status(500).json({ success: false, message: 'Error en el proceso de login.' });
  }
};


// ── POST /auth/register ───────────────────────────────────────────────────────
const register = async (req, res) => {
  try {
    const { name, email, password, feriaId, puestoInfo } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Los campos name, email y password son obligatorios.' });
    }
    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'La contraseña debe tener al menos 8 caracteres.' });
    }

    const existing = await Usuario.findOne({
      where: { email: email.toLowerCase().trim() },
    });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Ya existe una cuenta registrada con este correo electrónico.' });
    }

    // Forzar el rol de Usuario por seguridad
    const roleName = 'Usuario';
    const dbRole = await Role.findOne({ where: { nombre: roleName } });
    if (!dbRole) {
      return res.status(500).json({ success: false, message: 'Rol por defecto no encontrado.' });
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password.trim(), 10);

    const usuario = await Usuario.create({
      name:     name.trim(),
      email:    email.toLowerCase().trim(),
      password: hashedPassword,
      roleId:   dbRole.id,
      status:   'Activo',
      feriaId:  feriaId || null,
      puestoInfo: puestoInfo || null,
    });

    return res.status(201).json({
      success: true,
      data: { user: safeUser(usuario, roleName) },
    });
  } catch (error) {
    console.error('[AuthController.register]', error);
    return res.status(400).json({ success: false, message: error.message });
  }
};


// ── GET /auth/me ──────────────────────────────────────────────────────────────
const me = async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.user.id, {
        include: [{ model: Role, as: 'rol' }]
    });
    if (!usuario) return res.status(404).json({ success: false, message: 'Usuario no encontrado.' });
    const roleName = usuario.rol ? usuario.rol.nombre : 'Usuario';
    return res.json({ success: true, data: safeUser(usuario, roleName) });
  } catch (error) {
    console.error('[AuthController.me]', error);
    return res.status(500).json({ success: false, message: 'Error al obtener el perfil.' });
  }
};


// ── POST /auth/logout ─────────────────────────────────────────────────────────
// Limpia la cookie httpOnly. El frontend no puede borrarla por sí mismo (esa
// es la idea de httpOnly), así que necesitamos un endpoint dedicado.
const logout = (_req, res) => {
  res.clearCookie('agromap_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
  return res.json({ success: true });
};


// ── POST /auth/forgot-password ───────────────────────────────────────────────
// Recibe un email. Si existe el usuario, genera un JWT con `purpose:'password-reset'`
// (válido 5 min) y envía un link al correo. Si no hay SMTP configurado, el link
// se imprime en la consola del backend (modo dev).
//
// IMPORTANTE: respondemos siempre 200 con el mismo mensaje, exista o no el email,
// para no revelar qué cuentas están registradas (enumeración de usuarios).
const forgotPassword = async (req, res) => {
  try {
    const email = (req.body.email || '').toLowerCase().trim();
    let devResetUrl = null;
    if (!email) {
      return res.status(400).json({ success: false, message: 'El email es requerido.' });
    }

    const usuario = await Usuario.findOne({ where: { email } });
    if (usuario) {
      const token = jwt.sign(
        {
          id: usuario.id,
          purpose: 'password-reset',
          pwd: passwordResetFingerprint(usuario.password),
        },
        process.env.JWT_SECRET,
        { expiresIn: RESET_PASSWORD_EXPIRES }
      );
      const frontend = process.env.FRONTEND_URL || 'http://localhost:5173';
      const resetUrl = `${frontend}/reset-password?token=${encodeURIComponent(token)}`;

      const subject = 'AgroMap — Recuperación de contraseña';
      const html = `
        <div style="font-family: system-ui, sans-serif; max-width: 520px; margin: 0 auto;">
          <h2 style="color: #166534;">Recuperación de contraseña</h2>
          <p>Hola${usuario.name ? ` <strong>${usuario.name}</strong>` : ''},</p>
          <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en AgroMap.
             Si fuiste vos, hacé clic en el botón. El enlace expira en 5 minutos.</p>
          <p style="margin: 28px 0;">
            <a href="${resetUrl}"
               style="background:#2d8a42;color:#fff;padding:12px 22px;border-radius:8px;text-decoration:none;font-weight:600;">
              Restablecer contraseña
            </a>
          </p>
          <p style="font-size: 0.9rem; color: #555;">
            Si el botón no funciona, copiá y pegá este enlace en tu navegador:<br>
            <span style="color:#2d8a42;">${resetUrl}</span>
          </p>
          <p style="font-size: 0.85rem; color: #888;">
            Si no solicitaste este cambio, podés ignorar este mensaje.
          </p>
        </div>
      `;
      const text = `Para restablecer tu contraseña en AgroMap, abrí este enlace (válido 5 min):\n${resetUrl}\nSi no fuiste vos, ignorá este mensaje.`;

      try {
        const mailResult = await sendMail({ to: usuario.email, subject, html, text });
        if (mailResult && mailResult.dev && process.env.NODE_ENV !== 'production') {
          devResetUrl = resetUrl;
        }
      } catch (mailErr) {
        console.error('[Auth] forgotPassword sendMail:', mailErr.message);
      }
    }

    if (devResetUrl) {
      return res.json({
        success: true,
        message: 'Si el correo está registrado, te enviamos un enlace para restablecer la contraseña.',
        devResetUrl,
      });
    }

    return res.json({
      success: true,
      message: 'Si el correo está registrado, te enviamos un enlace para restablecer la contraseña.',
    });
  } catch (error) {
    console.error('[Auth] forgotPassword:', error);
    return res.status(500).json({ success: false, message: 'Error al procesar la solicitud.' });
  }
};


// ── POST /auth/reset-password ────────────────────────────────────────────────
// Recibe `{ token, newPassword }`. Valida el JWT (purpose='password-reset',
// no expirado) y actualiza el password del usuario.
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body || {};
    if (!token || !newPassword) {
      return res.status(400).json({ success: false, message: 'Token y nueva contraseña son requeridos.' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'La contraseña debe tener al menos 8 caracteres.' });
    }

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
      const msg = e.name === 'TokenExpiredError'
        ? 'El enlace expiró. Solicitá uno nuevo.'
        : 'El enlace no es válido.';
      return res.status(400).json({ success: false, message: msg });
    }

    if (payload.purpose !== 'password-reset' || !payload.id || !payload.pwd) {
      return res.status(400).json({ success: false, message: 'El enlace no es válido.' });
    }

    const usuario = await Usuario.findByPk(payload.id);
    if (!usuario) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado.' });
    }

    if (payload.pwd !== passwordResetFingerprint(usuario.password)) {
      return res.status(400).json({ success: false, message: 'El enlace ya fue utilizado o no es válido. Solicitá uno nuevo.' });
    }

    const hashed = await bcrypt.hash(newPassword.trim(), 10);
    await usuario.update({ password: hashed });

    return res.json({ success: true, message: 'Contraseña actualizada. Ya podés iniciar sesión.' });
  } catch (error) {
    console.error('[Auth] resetPassword:', error);
    return res.status(500).json({ success: false, message: 'Error al restablecer la contraseña.' });
  }
};

module.exports = { login, register, me, logout, forgotPassword, resetPassword };
