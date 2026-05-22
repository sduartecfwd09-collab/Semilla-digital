'use strict';

// Roles: 1=Administrador, 2=Productor, 3=Usuario
// Permisos: ver catálogo en 010-seed-permisos.js

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const asignaciones = [];

    // ═══════════════════════════════════════════════════════════
    // ADMINISTRADOR (role_id: 1) — TODOS los permisos (1-30)
    // ═══════════════════════════════════════════════════════════
    for (let permisoId = 1; permisoId <= 30; permisoId++) {
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

    await queryInterface.bulkInsert('role_permiso', asignaciones, {});
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('role_permiso', null, {});
  },
};
