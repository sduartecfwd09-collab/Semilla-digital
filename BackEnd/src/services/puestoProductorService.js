// ============================================================
// Service: PuestoProductor
// Descripción: Lógica de negocio para puestos de productor
// ============================================================
const {
  PuestoProductor,
  PuestoFeria,
  Usuario,
  Feria,
  Direccion,
  Provincia,
  Canton,
  Distrito,
} = require('../models');
const { validateProductorApplication } = require('../validators/productorApplicationValidator');

const mapPuestoParaFrontend = (p) => {
  if (!p) return null;
  const raw = p.toJSON ? p.toJSON() : p;
  
  // Mapear fotos nombres
  let fotosNombres = raw.fotos_nombres;
  if (typeof fotosNombres === 'string') {
    try {
      fotosNombres = JSON.parse(fotosNombres);
    } catch (e) {
      fotosNombres = [];
    }
  }

  return {
    id: raw.id,
    usuarioId: raw.usuario_id,
    feriaId: raw.feria_id,
    direccionId: raw.direccion_id,
    nombrePuesto: raw.nombre_puesto,
    descripcion: raw.descripcion,
    telefono: raw.telefono,
    email: raw.email,
    horarios: raw.horarios,
    horariosList: raw.horarios_list,
    tiposProducto: raw.tipos_producto,
    metodosCultivo: raw.metodos_cultivo,
    redesSociales: raw.redes_sociales,
    fotosCloudinary: raw.datos_extendidos?.documentation?.documents?.filter((doc) => doc.key === 'foto_puesto') || [],
    fotosNombres: fotosNombres || [],
    datosExtendidos: raw.datos_extendidos || null,
    fechaRegistro: raw.fecha_registro,
    ubicacion: raw.ubicacion || (raw.feriaPrincipal ? [raw.feriaPrincipal.nombre] : []),
    createdAt: raw.createdAt || raw.created_at,
    updatedAt: raw.updatedAt || raw.updated_at,
    usuario: raw.usuario ? {
      id: raw.usuario.id,
      name: raw.usuario.name,
      nombre: raw.usuario.nombre,
      email: raw.usuario.email,
      role: raw.usuario.role
    } : null,
    feriaPrincipal: raw.feriaPrincipal,
    direccion: raw.direccion,
    ferias: raw.ferias
  };
};

const includeAll = [
  { model: Usuario, as: 'usuario', attributes: ['id', 'name', 'nombre', 'email', 'roleId'] },
  { model: Feria, as: 'feriaPrincipal' },
  {
    model: Direccion,
    as: 'direccion',
    include: [
      { model: Provincia, as: 'provincia' },
      { model: Canton, as: 'canton' },
      { model: Distrito, as: 'distrito' },
    ],
  },
  { model: Feria, as: 'ferias', through: { attributes: [] } },
];

const findAll = async (query = {}) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 20;
  const offset = (page - 1) * limit;

  const list = await PuestoProductor.findAndCountAll({
    limit,
    offset,
    include: includeAll,
    order: [['fecha_registro', 'DESC']],
  });
  return { count: list.count, rows: list.rows.map(mapPuestoParaFrontend) };
};

const findById = async (id) => {
  const item = await PuestoProductor.findByPk(id, {
    include: includeAll,
  });
  return mapPuestoParaFrontend(item);
};

const findByUsuario = async (usuarioId) => {
  const item = await PuestoProductor.findOne({
    where: { usuario_id: usuarioId },
    include: includeAll,
  });
  return mapPuestoParaFrontend(item);
};

const findByFeria = async (feriaId) => {
  const list = await PuestoProductor.findAll({
    where: { feria_id: feriaId },
    include: [
      { model: Usuario, as: 'usuario', attributes: ['id', 'name', 'nombre', 'email'] },
    ],
    order: [['nombre_puesto', 'ASC']],
  });
  return list.map(mapPuestoParaFrontend);
};

const create = async (data) => {
  // Mapear campos de frontend (camelCase) a backend (snake_case) si es necesario
  const usuario_id = data.usuario_id || data.usuarioId;
  const nombre_puesto = data.nombre_puesto || data.nombrePuesto;
  let feria_id = data.feria_id || data.feriaId;

  if (!nombre_puesto) {
    throw new Error('El nombre del puesto es requerido');
  }
  if (!usuario_id) {
    throw new Error('El usuario es requerido');
  }

  // Verificar que el usuario no tenga ya un puesto (relación 1:1)
  const existing = await PuestoProductor.findOne({
    where: { usuario_id },
  });
  if (existing) {
    throw new Error('Este usuario ya tiene un puesto registrado');
  }

  // Si feria_id es un string no numérico (ej: google-San José-1),
  // intentamos asociarla buscando o registrando la feria por su nombre.
  if (feria_id && isNaN(Number(feria_id))) {
    const feriaName = data.ubicacion && data.ubicacion[0];
    if (feriaName) {
      let existingFeria = await Feria.findOne({ where: { nombre: feriaName } });
      if (!existingFeria) {
        existingFeria = await Feria.create({
          nombre: feriaName,
          source: 'google'
        });
      }
      feria_id = existingFeria.id;
    } else {
      feria_id = null;
    }
  } else {
    feria_id = feria_id ? Number(feria_id) : null;
  }

  const fotos_nombres = data.fotos_nombres || data.fotosNombres;

  const createData = { ...data };
  delete createData.feriaId;
  delete createData.usuarioId;
  delete createData.nombrePuesto;
  delete createData.fotosBase64;
  delete createData.fotosNombres;
  delete createData.datosExtendidos;

  const datos_extendidos = data.datos_extendidos ?? data.datosExtendidos ?? null;
  const validationErrors = validateProductorApplication(datos_extendidos);
  if (validationErrors.length) {
    throw new Error(`Solicitud de productor invalida: ${validationErrors.join(', ')}`);
  }

  const created = await PuestoProductor.create({
    ...createData,
    usuario_id,
    nombre_puesto,
    feria_id,
    fotos_nombres,
    datos_extendidos,
    fecha_registro: new Date(),
  });
  return mapPuestoParaFrontend(created);
};

const update = async (id, data) => {
  const puesto = await PuestoProductor.findByPk(id);
  if (!puesto) {
    throw new Error('Puesto no encontrado');
  }

  const updateData = { ...data };

  // Eliminar campos camelCase que Sequelize podría intentar mapear automáticamente a snake_case
  // y que causarían conflictos (como feriaId con valor string).
  delete updateData.feriaId;
  delete updateData.usuarioId;
  delete updateData.nombrePuesto;
  delete updateData.fotosBase64;
  delete updateData.fotosNombres;
  delete updateData.datosExtendidos;

  if (data.datos_extendidos !== undefined || data.datosExtendidos !== undefined) {
    updateData.datos_extendidos = data.datos_extendidos ?? data.datosExtendidos;
  }
  const validationErrors = validateProductorApplication(updateData.datos_extendidos);
  if (validationErrors.length) {
    throw new Error(`Solicitud de productor invalida: ${validationErrors.join(', ')}`);
  }

  // Mapear camelCase a snake_case de forma segura
  if (data.usuarioId) updateData.usuario_id = data.usuarioId;
  if (data.nombrePuesto) updateData.nombre_puesto = data.nombrePuesto;
  if (data.fotosNombres !== undefined) updateData.fotos_nombres = data.fotosNombres;

  let feria_id = data.feriaId || data.feria_id;
  if (feria_id !== undefined) {
    if (feria_id && isNaN(Number(feria_id))) {
      const feriaName = data.ubicacion && data.ubicacion[0];
      if (feriaName) {
        let existingFeria = await Feria.findOne({ where: { nombre: feriaName } });
        if (!existingFeria) {
          existingFeria = await Feria.create({
            nombre: feriaName,
            source: 'google'
          });
        }
        updateData.feria_id = existingFeria.id;
      } else {
        updateData.feria_id = null;
      }
    } else {
      updateData.feria_id = feria_id ? Number(feria_id) : null;
    }
  }

  const updated = await puesto.update(updateData);
  return mapPuestoParaFrontend(updated);
};

const remove = async (id) => {
  const puesto = await PuestoProductor.findByPk(id);
  if (!puesto) {
    throw new Error('Puesto no encontrado');
  }
  await puesto.destroy();
  return true;
};

// ── Gestión de puesto_ferias (autorización por feria, Enfoque B) ─────────────

// Autoriza al puesto a vender en una feria. Idempotente: si la fila ya existe,
// devuelve el puesto actualizado sin error. Retorna el puesto mapeado con su
// nueva lista de ferias.
const addFeria = async (puestoId, feriaId) => {
  const puesto = await PuestoProductor.findByPk(puestoId);
  if (!puesto) {
    const err = new Error('Puesto no encontrado');
    err.status = 404;
    throw err;
  }

  const feria = await Feria.findByPk(feriaId);
  if (!feria) {
    const err = new Error('Feria no encontrada');
    err.status = 404;
    throw err;
  }

  await PuestoFeria.findOrCreate({
    where: { puesto_id: puesto.id, feria_id: feria.id },
    defaults: { puesto_id: puesto.id, feria_id: feria.id },
  });

  return findById(puestoId);
};

// Desautoriza al puesto en una feria. Bloquea borrar la feria principal:
// `puestos_productor.feria_id` se usa como display + atribución de ventas.
// Si admin necesita quitarla, primero debe cambiar la feria principal del puesto.
const removeFeria = async (puestoId, feriaId) => {
  const puesto = await PuestoProductor.findByPk(puestoId);
  if (!puesto) {
    const err = new Error('Puesto no encontrado');
    err.status = 404;
    throw err;
  }

  if (Number(puesto.feria_id) === Number(feriaId)) {
    const err = new Error(
      'No podés quitar la feria principal del puesto. Cambiá la feria principal primero.'
    );
    err.status = 409;
    throw err;
  }

  const deleted = await PuestoFeria.destroy({
    where: { puesto_id: puesto.id, feria_id: feriaId },
  });
  if (deleted === 0) {
    const err = new Error('La feria no estaba autorizada para este puesto');
    err.status = 404;
    throw err;
  }

  return findById(puestoId);
};

module.exports = { findAll, findById, findByUsuario, findByFeria, create, update, remove, addFeria, removeFeria };
