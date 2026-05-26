const router = require('express').Router();
const ctrl = require('../controllers/productorController');

// Las rutas /productores/* requieren verifyToken (aplicado en routes/index.js).
//
// GET /productores/me/ferias → lista de ferias autorizadas para el productor
//                              actualmente logueado. Cualquier usuario autenticado
//                              puede llamarlo; si no es productor o aún no fue
//                              aprobado, recibe [].
router.get('/me/ferias', ctrl.getMisFerias);

module.exports = router;
