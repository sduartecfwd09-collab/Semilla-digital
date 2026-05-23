'use strict';
const router = require('express').Router();
const { login, register, me } = require('../controllers/authController');
const { verifyToken } = require('../middlewares/authMiddleware');
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({ 
  windowMs: 15 * 60 * 1000, 
  max: 10, 
  message: { error: 'Demasiados intentos. Reintenta en 15 minutos.' } 
});

const registerLimiter = rateLimit({ 
  windowMs: 60 * 60 * 1000, 
  max: 5 
});

// POST /auth/login    → credenciales → devuelve { token, user }
router.post('/login', loginLimiter, login);

// POST /auth/register → datos de nuevo usuario → devuelve { token, user }
router.post('/register', registerLimiter, register);

// GET  /auth/me       → requiere token → devuelve perfil del usuario actual
router.get('/me', verifyToken, me);

module.exports = router;
