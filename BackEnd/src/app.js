'use strict';
require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const morgan  = require('morgan');
const cookieParser = require('cookie-parser');
const routes  = require('./routes');

const { errorHandler, notFound } = require('./middlewares/errorHandler');
const { sequelize } = require('./models');
const http = require('http');
const socket = require('./socket');

const app  = express();
const PORT = process.env.PORT || 3002;
const server = http.createServer(app);
const io = socket.init(server);

io.on('connection', (client) => {
  console.log('🔗 Cliente conectado a WebSocket:', client.id);
  
  client.on('joinOrder', (orderId) => {
    client.join(`order_${orderId}`);
  });
  
  client.on('joinDriver', (driverId) => {
    client.join(`driver_${driverId}`);
  });

  client.on('disconnect', () => {
    console.log('❌ Cliente desconectado:', client.id);
  });
});

// ── Middlewares globales ──────────────────────────────────────────────────────
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());


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
      '/recetas', '/puestosAgricultor', '/solicitudesCambioRol', '/contactMessages',
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
      // Sincronización automática desactivada (migración manual ya aplicada)
      // await sequelize.sync({ alter: true });
      // console.log('✅ Modelos sincronizados con la base de datos');
      server.listen(PORT, () => {
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
