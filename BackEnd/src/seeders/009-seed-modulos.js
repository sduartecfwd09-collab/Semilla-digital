'use strict';

module.exports = {
  async up(queryInterface) {
    const modulos = [
      { id: 1,  clave: 'usuarios',      nombre: 'Gestión de Usuarios',       descripcion: 'CRUD y administración de cuentas de usuario',     icono: '👥', orden: 1, created_at: new Date(), updated_at: new Date() },
      { id: 2,  clave: 'roles',          nombre: 'Gestión de Roles',          descripcion: 'Crear, editar y asignar roles y permisos',        icono: '🛡️', orden: 2, created_at: new Date(), updated_at: new Date() },
      { id: 3,  clave: 'productos',      nombre: 'Gestión de Productos',      descripcion: 'CRUD de productos agrícolas',                     icono: '🥬', orden: 3, created_at: new Date(), updated_at: new Date() },
      { id: 4,  clave: 'ferias',         nombre: 'Gestión de Ferias',         descripcion: 'Administración de ferias del productor',           icono: '🏪', orden: 4, created_at: new Date(), updated_at: new Date() },
      { id: 5,  clave: 'solicitudes',    nombre: 'Solicitudes de Rol',        descripcion: 'Gestión de solicitudes de cambio de rol',          icono: '📋', orden: 5, created_at: new Date(), updated_at: new Date() },
      { id: 6,  clave: 'puestos',        nombre: 'Puestos de Productor',      descripcion: 'Gestión de puestos en ferias',                    icono: '🏕️', orden: 6, created_at: new Date(), updated_at: new Date() },
      { id: 7,  clave: 'recetas',        nombre: 'Gestión de Recetas',        descripcion: 'CRUD de recetas con productos de feria',           icono: '📖', orden: 7, created_at: new Date(), updated_at: new Date() },
      { id: 8,  clave: 'proformas',      nombre: 'Proformas',                 descripcion: 'Gestión de proformas y cotizaciones',              icono: '📄', orden: 8, created_at: new Date(), updated_at: new Date() },
      { id: 9,  clave: 'mensajes',       nombre: 'Mensajes de Contacto',      descripcion: 'Gestión de mensajes del formulario de contacto',   icono: '✉️', orden: 9, created_at: new Date(), updated_at: new Date() },
      { id: 10, clave: 'auditoria',      nombre: 'Auditoría',                 descripcion: 'Visualización de logs de auditoría del sistema',   icono: '📊', orden: 10, created_at: new Date(), updated_at: new Date() },
      { id: 11, clave: 'configuracion',  nombre: 'Configuración del Sistema', descripcion: 'Parámetros generales del sistema',                 icono: '⚙️', orden: 11, created_at: new Date(), updated_at: new Date() },
    ];

    const existing = await queryInterface.sequelize.query(
      "SELECT id FROM modulos",
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    const existingIds = existing.map(m => m.id);
    const toInsert = modulos.filter(m => !existingIds.includes(m.id));

    if (toInsert.length > 0) {
      await queryInterface.bulkInsert('modulos', toInsert, {});
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('modulos', null, {});
  },
};
