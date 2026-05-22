// ============================================================
// Service: Feria
// Descripción: Lógica de negocio para ferias
// ============================================================
const { Feria, Direccion, Provincia, Canton, Distrito } = require('../models');

const includeDireccion = {
  model: Direccion,
  as: 'direccion',
  include: [
    { model: Provincia, as: 'provincia' },
    { model: Canton, as: 'canton' },
    { model: Distrito, as: 'distrito' },
  ],
};

const findAll = async () => {
  return await Feria.findAll({
    include: [includeDireccion],
    order: [['nombre', 'ASC']],
  });
};

const findById = async (id) => {
  return await Feria.findByPk(id, {
    include: [includeDireccion],
  });
};

const create = async (data) => {
  if (data.name) data.nombre = data.name;
  if (data.province) data.provincia = data.province;
  if (data.schedule) data.horario = data.schedule;

  if (!data.nombre) {
    throw new Error('El nombre de la feria es requerido');
  }

  // Idempotente por nombre: si ya existe una feria con ese nombre la devolvemos
  // en vez de duplicar. Esto permite que la sincronización desde el frontend
  // (Google Maps → backend) se ejecute múltiples veces sin generar duplicados.
  // Filtramos los campos que NO son atributos del modelo (provincia/direccion
  // vienen como strings desde el frontend pero la tabla usa direccion_id).
  const { provincia: _prov, direccion: _dir, ...modelData } = data;
  const [feria] = await Feria.findOrCreate({
    where: { nombre: data.nombre },
    defaults: modelData,
  });
  return feria;
};

const update = async (id, data) => {
  const feria = await Feria.findByPk(id);
  if (!feria) {
    throw new Error('Feria no encontrada');
  }

  if (data.name) data.nombre = data.name;
  if (data.province) data.provincia = data.province;
  if (data.schedule) data.horario = data.schedule;

  return await feria.update(data);
};

const remove = async (id) => {
  const feria = await Feria.findByPk(id);
  if (!feria) {
    throw new Error('Feria no encontrada');
  }
  await feria.destroy();
  return true;
};

module.exports = { findAll, findById, create, update, remove };
