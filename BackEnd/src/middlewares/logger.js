// ============================================================
// Middleware: Logger
// Descripción: Middleware global que registra cada petición
//              HTTP entrante en la consola
// ============================================================

const logger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
  next();
};

module.exports = logger;
