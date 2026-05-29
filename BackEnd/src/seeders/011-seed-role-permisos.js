'use strict';

// Roles: 1=Administrador, 2=Productor, 3=Usuario, 4=Repartidor
// Permisos: ver catálogo en 010-seed-permisos.js

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const asignaciones = [];

    // ═══════════════════════════════════════════════════════════
    // ADMINISTRADOR (role_id: 1) — TODOS los permisos (1-37)
    // ═══════════════════════════════════════════════════════════
    for (let permisoId = 1; permisoId <= 37; permisoId++) {
      asignaciones.push({
        role_id: 1,
        permiso_id: permisoId,
        otorgado: true,
        created_at: now,
        updated_at: now,
      });
    }

    // ═══════════════════════════════════════════════════════════
    // PRODUCTOR (role_id: 2)
    // ═══════════════════════════════════════════════════════════
    const permisosProductor = [
      10, // productos.ver
      11, // productos.crear
      12, // productos.editar
      13, // productos.eliminar
      14, // ferias.ver
      17, // solicitudes.crear
      20, // puestos.ver
      21, // puestos.crear
      23, // recetas.ver
      25, // proformas.ver
      26, // proformas.crear
    ];

    permisosProductor.forEach((permisoId) => {
      asignaciones.push({
        role_id: 2,
        permiso_id: permisoId,
        otorgado: true,
        created_at: now,
        updated_at: now,
      });
    });

    // ═══════════════════════════════════════════════════════════
    // USUARIO (role_id: 3)
    // ═══════════════════════════════════════════════════════════
    const permisosUsuario = [
      10, // productos.ver
      14, // ferias.ver
      17, // solicitudes.crear (solicitar ser productor)
      23, // recetas.ver
      25, // proformas.ver
      26, // proformas.crear
    ];

    permisosUsuario.forEach((permisoId) => {
      asignaciones.push({
        role_id: 3,
        permiso_id: permisoId,
        otorgado: true,
        created_at: now,
        updated_at: now,
      });
    });

    // ═══════════════════════════════════════════════════════════
    // REPARTIDOR (role_id: 4)
    // ═══════════════════════════════════════════════════════════
    const permisosRepartidor = [
      31, // delivery.ver_mi_perfil
      32, // delivery.actualizar_status
      33, // delivery.ver_mis_ordenes
      34, // delivery.aceptar_orden
      35, // delivery.rechazar_orden
      36, // delivery.actualizar_ubicacion
      37, // delivery.ver_mis_ganancias
    ];

    permisosRepartidor.forEach((permisoId) => {
      asignaciones.push({
        role_id: 4,
        permiso_id: permisoId,
        otorgado: true,
        created_at: now,
        updated_at: now,
      });
    });

    const existing = await queryInterface.sequelize.query(
      "SELECT role_id, permiso_id FROM `role_permiso`",
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    const existingKeys = new Set(existing.map(rp => `${rp.role_id}-${rp.permiso_id}`));
    const toInsert = asignaciones.filter(a => !existingKeys.has(`${a.role_id}-${a.permiso_id}`));

    if (toInsert.length > 0) {
      await queryInterface.bulkInsert('role_permiso', toInsert, {});
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('role_permiso', null, {});
  },
};
