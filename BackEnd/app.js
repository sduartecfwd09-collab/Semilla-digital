/**
 * Estructura del Proyecto:
 * src/
 *   config/
 *   models/
 *   migrations/
 *   seeders/
 *   services/
 *   controllers/
 *   routes/
 *   middlewares/
 *   app.js
 * server.js
 * .env
 * .env.example
 */

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const routes = require('./Routes'); // Router principal

const app = express();

// ── MIDDLEWARES GLOBALES ────────────────────────────────────

// Logger para peticiones HTTP
app.use(morgan('dev'));

// Configuración de CORS
const corsOptions = {
  origin: process.env.FRONTEND_URL || '*',
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Parsing de JSON y URL-encoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── RUTAS ───────────────────────────────────────────────────

// Montaje de la API
app.use('/api', routes);

// Ruta de bienvenida / check
app.get('/', (req, res) => {
  res.json({ message: 'Bienvenido a la API de AgroMap' });
});

// ── MANEJO DE ERRORES ───────────────────────────────────────

// Manejo de rutas no encontradas (404)
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `La ruta ${req.originalUrl} no existe en este servidor`
  });
});

// Middleware global de manejo de errores (500)
app.use((err, req, res, next) => {
  console.error('[SERVER ERROR]:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

module.exports = app;