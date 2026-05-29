'use strict';

/**
 * Crea el módulo `delivery` (id=12), sus 7 permisos (ids 31-37) y los
 * asigna al rol Repartidor (id=4). Además normaliza cualquier valor
 * legacy 'DRIVER' en solicitudes_cambio_rol.rol_solicitado → 'Repartidor'.
 *
 * Idempotente: cada inserción comprueba existencia previa.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    const { QueryTypes } = Sequelize;

    // 1) Módulo delivery (id=12)
    const modulosExistentes = await queryInterface.sequelize.query(
      'SELECT id FROM modulos WHERE id = 12',
      { type: QueryTypes.SELECT }
    );
    if (modulosExistentes.length === 0) {
      await queryInterface.bulkInsert('modulos', [{
        id: 12,
        clave: 'delivery',
        nombre: 'Delivery (Repartidores)',
        descripcion: 'Operaciones del repartidor: perfil, órdenes, ubicación y ganancias',
        icono: '🛵',
        orden: 12,
        created_at: now,
        updated_at: now,
      }]);
    }

    // 2) Permisos del módulo delivery (ids 31-37)
    const permisos = [
      { id: 31, clave: 'delivery.ver_mi_perfil',        nombre: 'Ver mi perfil de repartidor',  descripcion: 'Ver datos del perfil propio de repartidor' },
      { id: 32, clave: 'delivery.actualizar_status',    nombre: 'Actualizar status repartidor', descripcion: 'Cambiar disponibilidad (en línea / fuera de línea)' },
      { id: 33, clave: 'delivery.ver_mis_ordenes',      nombre: 'Ver mis órdenes',              descripcion: 'Listar órdenes asignadas al repartidor' },
      { id: 34, clave: 'delivery.aceptar_orden',        nombre: 'Aceptar orden',                descripcion: 'Aceptar una orden de entrega ofrecida' },
      { id: 35, clave: 'delivery.rechazar_orden',       nombre: 'Rechazar orden',               descripcion: 'Rechazar una orden de entrega ofrecida' },
      { id: 36, clave: 'delivery.actualizar_ubicacion', nombre: 'Actualizar ubicación',         descripcion: 'Reportar ubicación GPS del repartidor' },
      { id: 37, clave: 'delivery.ver_mis_ganancias',    nombre: 'Ver mis ganancias',            descripcion: 'Ver ganancias acumuladas del repartidor' },
    ];

    const permisosExistentes = await queryInterface.sequelize.query(
      'SELECT id, clave FROM permisos WHERE id BETWEEN 31 AND 37 OR clave LIKE \'delivery.%\'',
      { type: QueryTypes.SELECT }
    );
    const idsExistentes = new Set(permisosExistentes.map(p => p.id));
    const clavesExistentes = new Set(permisosExistentes.map(p => p.clave));

    const permisosAInsertar = permisos
      .filter(p => !idsExistentes.has(p.id) && !clavesExistentes.has(p.clave))
      .map(p => ({ ...p, modulo_id: 12, created_at: now, updated_at: now }));

    if (permisosAInsertar.length > 0) {
      await queryInterface.bulkInsert('permisos', permisosAInsertar);
    }

    // 3) Asignaciones role_permiso para Repartidor (role_id=4) y Administrador (role_id=1)
    const asignacionesExistentes = await queryInterface.sequelize.query(
      'SELECT role_id, permiso_id FROM role_permiso WHERE role_id IN (1, 4) AND permiso_id BETWEEN 31 AND 37',
      { type: QueryTypes.SELECT }
    );
    const claveAsignada = new Set(asignacionesExistentes.map(a => `${a.role_id}-${a.permiso_id}`));

    const asignacionesObjetivo = [];
    for (const pid of [31, 32, 33, 34, 35, 36, 37]) {
      asignacionesObjetivo.push({ role_id: 1, permiso_id: pid }); // Administrador: todos
      asignacionesObjetivo.push({ role_id: 4, permiso_id: pid }); // Repartidor: todos
    }

    const asignacionesAInsertar = asignacionesObjetivo
      .filter(a => !claveAsignada.has(`${a.role_id}-${a.permiso_id}`))
      .map(a => ({
        role_id: a.role_id,
        permiso_id: a.permiso_id,
        otorgado: true,
        created_at: now,
        updated_at: now,
      }));

    if (asignacionesAInsertar.length > 0) {
      await queryInterface.bulkInsert('role_permiso', asignacionesAInsertar);
    }

    // 4) Normalizar 'DRIVER' legacy en solicitudes_cambio_rol
    await queryInterface.sequelize.query(
      "UPDATE solicitudes_cambio_rol SET rol_solicitado = 'Repartidor' WHERE rol_solicitado = 'DRIVER'"
    );
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(
      'DELETE FROM role_permiso WHERE role_id = 4 AND permiso_id BETWEEN 31 AND 37'
    );
    await queryInterface.sequelize.query(
      'DELETE FROM permisos WHERE id BETWEEN 31 AND 37'
    );
    await queryInterface.sequelize.query(
      'DELETE FROM modulos WHERE id = 12'
    );
  },
};
