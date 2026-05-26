// ============================================================
// Service: Productor
// Descripción: Operaciones específicas del productor autenticado.
//              Por ahora expone solo las ferias donde el productor
//              está autorizado a vender (fuente de verdad: puesto_ferias).
// ============================================================
const {
  PuestoProductor,
  PuestoFeria,
  Feria,
  Direccion,
  Provincia,
  Canton,
  Distrito,
} = require('../models');

// Mismo shape que feriaService.findAll para que el frontend no tenga que
// distinguir entre "todas las ferias" y "mis ferias autorizadas" — solo cambia
// el origen del listado.
const includeDireccion = {
  model: Direccion,
  as: 'direccion',
  include: [
    { model: Provincia, as: 'provincia' },
    { model: Canton, as: 'canton' },
    { model: Distrito, as: 'distrito' },
  ],
};

// Devuelve las ferias donde el puesto del productor está autorizado.
// El productor solo tiene UN puesto (puestos_productor.usuario_id es UNIQUE),
// así que basta resolver el puesto y luego traer sus ferias vía puesto_ferias.
const findMisFerias = async (userId) => {
  const puesto = await PuestoProductor.findOne({
    where: { usuario_id: userId },
    include: [{
      model: Feria,
      as: 'ferias',
      through: { attributes: [] },
      include: [includeDireccion],
    }],
    order: [[{ model: Feria, as: 'ferias' }, 'nombre', 'ASC']],
  });

  // Usuario sin puesto (no es productor o aún no aprobado) → lista vacía.
  // El controller decide si esto es 200 + [] o un caso más específico.
  if (!puesto) return [];
  return puesto.ferias || [];
};

module.exports = { findMisFerias };
