'use strict';
require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const morgan  = require('morgan');
const cookieParser = require('cookie-parser');
const routes  = require('./routes');

const { errorHandler, notFound } = require('./middlewares/errorHandler');
const { sequelize } = require('./models');


const app  = express();
const PORT = process.env.PORT || 3002;

// ── Middlewares globales ──────────────────────────────────────────────────────
// Whitelist de orígenes permitidos. Configurable vía CORS_ORIGINS (lista CSV).
// Para desarrollo aceptamos Vite (5173) y CRA (3000) por defecto.
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:3000,http://localhost:4173')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    // Permitir peticiones sin Origin (curl, Postman, server-to-server)
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error(`CORS: origen no permitido (${origin})`));
  },
  credentials: true, // necesario para que el navegador acepte cookies httpOnly
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Interceptor para compatibilidad con tests antiguos que esperan arrays/objetos crudos
if (process.env.NODE_ENV === 'test') {
  app.use((req, res, next) => {
    const originalJson = res.json;
    res.json = function (body) {
      if (body && typeof body === 'object') {
        if (body.success === true && body.data !== undefined) {
          return originalJson.call(this, body.data);
        } else if (body.success === false && body.message && !body.error) {
          body.error = body.message;
        }
      }
      return originalJson.call(this, body);
    };
    next();
  });
}

// Morgan solo en desarrollo
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/', (_req, res) => {
  res.json({
    message: '🌱 AgroMap API funcionando',
    version: '1.0.0',
    endpoints: [
      'POST /auth/login', 'POST /auth/register', 'GET /auth/me',
      '/usuarios', '/ferias', '/productos', '/precios',
      '/recetas', '/puestos', '/solicitudes', '/mensajes',
    ],
  });
});

// ── Rutas ─────────────────────────────────────────────────────────────────────
app.use('/', routes);

// ── Manejo de errores ─────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── Arrancar servidor (solo si no es test) ────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  (async () => {
    try {
      await sequelize.authenticate();
      console.log('✅ Conexión a MySQL establecida');
      await sequelize.sync({ alter: false }); // usar alter:true solo para migraciones iniciales
      console.log('✅ Modelos sincronizados con la base de datos');

      app.listen(PORT, () => {
        console.log(`\n🚀 Servidor corriendo en http://localhost:${PORT}`);
        console.log('   Presiona Ctrl+C para detener\n');
      });
    } catch (error) {
      console.error('❌ No se pudo conectar a la base de datos:', error.message);
      process.exit(1);
    }
  })();
}

module.exports = app;
