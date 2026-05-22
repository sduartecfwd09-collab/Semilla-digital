'use strict';
const router = require('express').Router();
const { login, register, me, logout } = require('../controllers/authController');
const { verifyToken } = require('../middlewares/authMiddleware');

// POST /auth/login    → credenciales → devuelve { token, user } y setea cookie httpOnly
router.post('/login',    login);

// POST /auth/register → datos de nuevo usuario → devuelve { token, user } y setea cookie
router.post('/register', register);

// GET  /auth/me       → requiere token → devuelve perfil del usuario actual
router.get('/me', verifyToken, me);

// POST /auth/logout   → limpia la cookie httpOnly
router.post('/logout', logout);

module.exports = router;
