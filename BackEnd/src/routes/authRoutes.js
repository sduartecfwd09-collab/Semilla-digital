'use strict';
const router = require('express').Router();
const { login, register, me, logout, forgotPassword, resetPassword } = require('../controllers/authController');
const { verifyToken } = require('../middlewares/authMiddleware');

// POST /auth/login    → credenciales → devuelve { token, user } y setea cookie httpOnly
router.post('/login',    login);

// POST /auth/register → datos de nuevo usuario → devuelve { token, user } y setea cookie
router.post('/register', register);

// GET  /auth/me       → requiere token → devuelve perfil del usuario actual
router.get('/me', verifyToken, me);

// POST /auth/logout   → limpia la cookie httpOnly
router.post('/logout', logout);

// POST /auth/forgot-password → { email } → envía link de recuperación (público)
router.post('/forgot-password', forgotPassword);

// POST /auth/reset-password  → { token, newPassword } → actualiza contraseña (público)
router.post('/reset-password', resetPassword);

module.exports = router;
