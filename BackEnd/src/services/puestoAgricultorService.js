// ============================================================
// Service: PuestoAgricultor
// Descripción: Lógica de negocio para puestos de agricultor
// ============================================================
const {
  PuestoAgricultor,
  Usuario,
  Feria,
  Direccion,
  Provincia,
  Canton,
  Distrito,
} = require('../models');

const mapPuestoParaFrontend = (p) => {
  if (!p) return null;
  const raw = p.toJSON ? p.toJSON() : p;
  
  // Mapear fotos base64
  let fotosBase64 = raw.fotos_base64;
  if (typeof fotosBase64 === 'string') {
    try {
      fotosBase64 = JSON.parse(fotosBase64);
    } catch (e) {
      fotosBase64 = [];
    }
  }

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
    fotosBase64: fotosBase64 || [],
    fotosNombres: fotosNombres || [],
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
  { model: Usuario, as: 'usuario', attributes: ['id', 'name', 'nombre', 'email', 'role'] },
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
  const list = await PuestoAgricultor.findAll({
    include: includeAll,
    order: [['fecha_registro', 'DESC']],
  });
  return list.map(mapPuestoParaFrontend);
};

const findById = async (id) => {
  const item = await PuestoAgricultor.findByPk(id, {
    include: includeAll,
  });
  return mapPuestoParaFrontend(item);
};

const findByUsuario = async (usuarioId) => {
  const item = await PuestoAgricultor.findOne({
    where: { usuario_id: usuarioId },
    include: includeAll,
  });
  return mapPuestoParaFrontend(item);
};

const findByFeria = async (feriaId) => {
  const list = await PuestoAgricultor.findAll({
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
  const existing = await PuestoAgricultor.findOne({
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

  const fotos_base64 = data.fotos_base64 || data.fotosBase64;
  const fotos_nombres = data.fotos_nombres || data.fotosNombres;

  const createData = { ...data };
  delete createData.feriaId;
  delete createData.usuarioId;
  delete createData.nombrePuesto;
  delete createData.fotosBase64;
  delete createData.fotosNombres;

  console.log(">>> DEBUG PUESTO CREATE DATA:", createData);

  const created = await PuestoAgricultor.create({
    ...createData,
    usuario_id,
    nombre_puesto,
    feria_id,
    fotos_base64,
    fotos_nombres,
    fecha_registro: new Date(),
  });
  return mapPuestoParaFrontend(created);
};

const update = async (id, data) => {
  const puesto = await PuestoAgricultor.findByPk(id);
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

  // Mapear camelCase a snake_case de forma segura
  if (data.usuarioId) updateData.usuario_id = data.usuarioId;
  if (data.nombrePuesto) updateData.nombre_puesto = data.nombrePuesto;
  if (data.fotosBase64 !== undefined) updateData.fotos_base64 = data.fotosBase64;
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

  console.log(">>> DEBUG PUESTO UPDATE DATA:", updateData);
  console.log(">>> DEBUG PUESTO ORIGINAL DATA:", data);

  const updated = await puesto.update(updateData);
  return mapPuestoParaFrontend(updated);
};

const remove = async (id) => {
  const puesto = await PuestoAgricultor.findByPk(id);
  if (!puesto) {
    throw new Error('Puesto no encontrado');
  }
  await puesto.destroy();
  return true;
};

module.exports = { findAll, findById, findByUsuario, findByFeria, create, update, remove };
