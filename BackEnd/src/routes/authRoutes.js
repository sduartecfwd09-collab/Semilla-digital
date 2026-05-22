'use strict';
const router = require('express').Router();
const { login, register, me } = require('../controllers/authController');
const { verifyToken } = require('../middlewares/authMiddleware');

// POST /auth/login    → credenciales → devuelve { token, user }
router.post('/login',    login);

// POST /auth/register → datos de nuevo usuario → devuelve { token, user }
router.post('/register', register);

// GET  /auth/me       → requiere token → devuelve perfil del usuario actual
router.get('/me', verifyToken, me);

module.exports = router;
