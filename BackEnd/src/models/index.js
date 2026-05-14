'use strict';
const sequelize = require('../config/database');
const Usuario = require('./Usuario');
const Feria = require('./Feria');
const PuestoAgricultor = require('./PuestoAgricultor');
const Producto = require('./Producto');
const Precio = require('./Precio');
const Receta = require('./Receta');
const SolicitudCambioRol = require('./SolicitudCambioRol');
const ContactMessage = require('./ContactMessage');

// ── Asociaciones ──────────────────────────────────────────────────────────────

// Usuario → PuestoAgricultor (1:N)
Usuario.hasMany(PuestoAgricultor, { foreignKey: 'usuarioId', as: 'puestos', onDelete: 'CASCADE' });
PuestoAgricultor.belongsTo(Usuario, { foreignKey: 'usuarioId', as: 'usuario' });

// Usuario → Producto (1:N)
Usuario.hasMany(Producto, { foreignKey: 'userId', as: 'productos', onDelete: 'CASCADE' });
Producto.belongsTo(Usuario, { foreignKey: 'userId', as: 'usuario' });

// Producto → Precio (1:N)
Producto.hasMany(Precio, { foreignKey: 'productoId', as: 'precios', onDelete: 'CASCADE' });
Precio.belongsTo(Producto, { foreignKey: 'productoId', as: 'producto' });

// Usuario → SolicitudCambioRol (1:N)
Usuario.hasMany(SolicitudCambioRol, { foreignKey: 'usuarioId', as: 'solicitudes', onDelete: 'CASCADE' });
SolicitudCambioRol.belongsTo(Usuario, { foreignKey: 'usuarioId', as: 'usuario' });

module.exports = {
  sequelize,
  Usuario,
  Feria,
  PuestoAgricultor,
  Producto,
  Precio,
  Receta,
  SolicitudCambioRol,
  ContactMessage,
};
