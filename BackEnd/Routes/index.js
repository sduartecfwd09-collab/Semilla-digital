// ============================================================
// Routes/index.js
// Enrutador maestro: monta todos los sub-routers bajo /api
// ============================================================
const router = require('express').Router();

// ── Importación de sub-routers ──────────────────────────────
const provinciaRoutes         = require('./provinciaRoutes');
const cantonRoutes            = require('./cantonRoutes');
const distritoRoutes          = require('./distritoRoutes');
const direccionRoutes         = require('./direccionRoutes');
const feriaRoutes             = require('./feriaRoutes');
const usuarioRoutes           = require('./usuarioRoutes');
const productoRoutes          = require('./productoRoutes');
const recetaRoutes            = require('./recetaRoutes');
const solicitudRoutes         = require('./solicitudCambioRolRoutes');
const puestoAgricultorRoutes  = require('./puestoAgricultorRoutes');
const ofertaProductoRoutes    = require('./ofertaProductoRoutes');
const mensajeContactoRoutes   = require('./mensajeContactoRoutes');
const proformaRoutes          = require('./proformaRoutes');

// ── Montaje de rutas ────────────────────────────────────────
router.use('/provincias',   provinciaRoutes);
router.use('/cantones',     cantonRoutes);
router.use('/distritos',    distritoRoutes);
router.use('/direcciones',  direccionRoutes);
router.use('/ferias',       feriaRoutes);
router.use('/usuarios',     usuarioRoutes);
router.use('/productos',    productoRoutes);
router.use('/recetas',      recetaRoutes);
router.use('/solicitudes',  solicitudRoutes);
router.use('/puestos',      puestoAgricultorRoutes);
router.use('/ofertas',      ofertaProductoRoutes);
router.use('/mensajes',     mensajeContactoRoutes);
router.use('/proformas',    proformaRoutes);

module.exports = router;
