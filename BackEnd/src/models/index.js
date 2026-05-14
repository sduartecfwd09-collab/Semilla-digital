'use strict';
const { Sequelize } = require('sequelize');
const config = require('../../Config/config'); // Usa la config de Coto

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
    define: dbConfig.define,
  }
);

const models = {
  Role: require('./Role')(sequelize),
  Provincia: require('./Provincia')(sequelize),
  Canton: require('./Canton')(sequelize),
  Distrito: require('./Distrito')(sequelize),
  Direccion: require('./Direccion')(sequelize),
  Usuario: require('./Usuario')(sequelize),
  Feria: require('./Feria')(sequelize),
  Producto: require('./Producto')(sequelize),
  Receta: require('./Receta')(sequelize),
  SolicitudCambioRol: require('./SolicitudCambioRol')(sequelize),
  PuestoAgricultor: require('./PuestoAgricultor')(sequelize),
  PuestoFeria: require('./PuestoFeria')(sequelize),
  OfertaProducto: require('./OfertaProducto')(sequelize),
  RecetaIngrediente: require('./RecetaIngrediente')(sequelize),
  MensajeContacto: require('./MensajeContacto')(sequelize),
  Proforma: require('./Proforma')(sequelize),
  // ── RBAC & Auditoría (nuevos) ──────────────────────────────
  Modulo: require('./Modulo')(sequelize),
  Permiso: require('./Permiso')(sequelize),
  RolePermiso: require('./RolePermiso')(sequelize),
  AuditLog: require('./AuditLog')(sequelize),
};

// Inicialización de asociaciones
Object.values(models).forEach((model) => {
  if (typeof model.associate === 'function') {
    model.associate(models);
  }
});

module.exports = {
  sequelize,
  Sequelize,
  ...models,
};
