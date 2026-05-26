'use strict';
require('dotenv').config();
const express = require('express');
const path    = require('path');
const cors    = require('cors');
const morgan  = require('morgan');
const cookieParser = require('cookie-parser');
const routes  = require('./routes');
const jwt = require('jsonwebtoken');
const helmet = require('helmet');

const { errorHandler, notFound } = require('./middlewares/errorHandler');
const { sequelize } = require('./models');
const http = require('http');
const socket = require('./socket');

const app  = express();
app.use(helmet());
const PORT = process.env.PORT || 3002;
const server = http.createServer(app);
const io = socket.init(server);

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error('Authentication required'));
  try {
    socket.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    next(new Error('Invalid token'));
  }
});

io.on('connection', (client) => {
  console.log('🔗 Cliente conectado a WebSocket:', client.id);
  
  client.on('joinOrder', (orderId) => {
    if (!client.user) return;
    client.join(`order_${orderId}`);
  });

  client.on('joinDriver', (driverId) => {
    if (!client.user) return;
    client.join(`driver_${driverId}`);
  });

  client.on('joinProducer', (productorId) => {
    if (!client.user) return;
    client.join(`producer_${productorId}`);
  });

  client.on('disconnect', () => {
    console.log('❌ Cliente desconectado:', client.id);
  });
});

// ── Middlewares globales ──────────────────────────────────────────────────────
// Whitelist de orígenes permitidos. Configurable vía CORS_ORIGINS (lista CSV).
// Para desarrollo aceptamos Vite (5173) y CRA (3000) por defecto.
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:3000,http://localhost:4173')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

// En desarrollo aceptamos cualquier puerto de localhost/127.0.0.1 porque Vite
// salta de puerto cuando el 5173 está ocupado. En producción la whitelist es estricta.
const isDev = process.env.NODE_ENV !== 'production';
const devLocalhostRegex = /^http:\/\/(localhost|127\.0\.0\.1):\d+$/;

app.use(cors({
  origin: (origin, cb) => {
    // Permitir peticiones sin Origin (curl, Postman, server-to-server)
    if (!origin) return cb(null, true);
    if (isDev && devLocalhostRegex.test(origin)) return cb(null, true);
    if (allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error(`CORS: origen no permitido (${origin})`));
  },
  credentials: true, // necesario para que el navegador acepte cookies httpOnly
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ limit: '1mb', extended: true }));
app.use(cookieParser());
app.use('/storage', express.static(path.join(__dirname, '../storage')));

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
      if (process.env.NODE_ENV !== 'production') {
        await sequelize.sync({ alter: false }); // usar alter:true solo para migraciones iniciales
        console.log('✅ Modelos sincronizados con la base de datos');
      }
      server.listen(PORT, () => {
        console.log(`\n🚀 Servidor corriendo en http://localhost:${PORT}`);
        console.log('   Presiona Ctrl+C para detener\n');
      });
    } catch (error) {
      console.error('❌ No se pudo conectar a la base de datos:', error.message);
      process.exit(1);
    }
  })();

  // ── Graceful shutdown ───────────────────────────────────────────────────────
  // Libera el puerto cuando nodemon reinicia o se recibe Ctrl+C. Sin esto,
  // Socket.IO mantiene conexiones TCP abiertas y deja el proceso huérfano.
  const shutdown = async (signal) => {
    console.log(`\n${signal} recibido. Cerrando servidor...`);
    // Cinturón de seguridad: si algo se cuelga, mata el proceso en 5s.
    const failSafe = setTimeout(() => {
      console.error('Shutdown excedió 5s, forzando salida.');
      process.exit(1);
    }, 5000).unref();
    try {
      io.close();
      await new Promise((resolve, reject) =>
        server.close((err) => (err ? reject(err) : resolve()))
      );
      await sequelize.close();
      clearTimeout(failSafe);
      console.log('✅ Servidor cerrado correctamente');
      process.exit(0);
    } catch (err) {
      console.error('Error durante shutdown:', err);
      process.exit(1);
    }
  };
  ['SIGINT', 'SIGTERM', 'SIGUSR2'].forEach((sig) =>
    process.once(sig, () => shutdown(sig))
  );
}

module.exports = app;
