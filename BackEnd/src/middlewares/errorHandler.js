'use strict';

// Middleware de manejo de errores centralizado
const errorHandler = (err, req, res, next) => {
  console.error('[ErrorHandler]', err);

  // Error de validación de Sequelize
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({
      error: err.errors.map((e) => e.message).join(' | '),
    });
  }

  // Error de FK o BD
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({ error: 'Error de referencia: entidad relacionada no existe.' });
  }

  // Error genérico
  const isProduction = process.env.NODE_ENV === 'production';
  return res.status(err.status || 500).json({
    error: isProduction ? 'Error interno del servidor.' : err.message,
  });
};

// Middleware para rutas no encontradas
const notFound = (req, res) => {
  return res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.path}` });
};

module.exports = { errorHandler, notFound };
