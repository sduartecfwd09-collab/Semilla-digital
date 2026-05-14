// ============================================================
// Models/index.js
// Punto de entrada de todos los modelos Sequelize.
// Inicializa la conexión, registra cada modelo y ejecuta
// las asociaciones definidas en cada archivo.
// ============================================================
const { Sequelize } = require('sequelize');
const config = require('../Config/config');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

// ── Instancia de Sequelize ──────────────────────────────────
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    define: dbConfig.define,
    logging: dbConfig.logging,
  }
);

// ── Registro de modelos ─────────────────────────────────────
const Provincia         = require('./provincia')(sequelize);
const Canton            = require('./canton')(sequelize);
const Distrito          = require('./distrito')(sequelize);
const Direccion         = require('./direccion')(sequelize);
const Usuario           = require('./usuario')(sequelize);
const Feria             = require('./feria')(sequelize);
const Producto          = require('./producto')(sequelize);
const Receta            = require('./receta')(sequelize);
const SolicitudCambioRol = require('./solicitudCambioRol')(sequelize);
const PuestoAgricultor  = require('./puestoAgricultor')(sequelize);
const PuestoFeria       = require('./puestoFeria')(sequelize);
const OfertaProducto    = require('./ofertaProducto')(sequelize);
const RecetaIngrediente = require('./recetaIngrediente')(sequelize);
const MensajeContacto   = require('./mensajeContacto')(sequelize);
const Proforma          = require('./proforma')(sequelize);

// ── Contenedor de modelos ───────────────────────────────────
const models = {
  Provincia,
  Canton,
  Distrito,
  Direccion,
  Usuario,
  Feria,
  Producto,
  Receta,
  SolicitudCambioRol,
  PuestoAgricultor,
  PuestoFeria,
  OfertaProducto,
  RecetaIngrediente,
  MensajeContacto,
  Proforma,
};

// ── Inicialización de asociaciones ──────────────────────────
Object.values(models).forEach((model) => {
  if (typeof model.associate === 'function') {
    model.associate(models);
  }
});

// ── Exportación ─────────────────────────────────────────────
module.exports = {
  sequelize,
  Sequelize,
  ...models,
};
