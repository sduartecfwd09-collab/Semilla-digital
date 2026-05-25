'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const permisos = [
      // ── Módulo: Usuarios (modulo_id: 1) ─────────────────────
      { id: 1,  clave: 'usuarios.ver',            nombre: 'Ver usuarios',              descripcion: 'Ver listado de todos los usuarios',             modulo_id: 1, created_at: new Date(), updated_at: new Date() },
      { id: 2,  clave: 'usuarios.crear',           nombre: 'Crear usuarios',            descripcion: 'Crear nuevos usuarios manualmente',              modulo_id: 1, created_at: new Date(), updated_at: new Date() },
      { id: 3,  clave: 'usuarios.editar',           nombre: 'Editar usuarios',           descripcion: 'Editar datos de usuarios existentes',            modulo_id: 1, created_at: new Date(), updated_at: new Date() },
      { id: 4,  clave: 'usuarios.eliminar',         nombre: 'Eliminar usuarios',         descripcion: 'Eliminar cuentas de usuario',                    modulo_id: 1, created_at: new Date(), updated_at: new Date() },
      { id: 5,  clave: 'usuarios.cambiar_status',   nombre: 'Cambiar status de usuario', descripcion: 'Activar o desactivar usuarios',                  modulo_id: 1, created_at: new Date(), updated_at: new Date() },

      // ── Módulo: Roles (modulo_id: 2) ────────────────────────
      { id: 6,  clave: 'roles.ver',               nombre: 'Ver roles',                 descripcion: 'Ver roles del sistema',                          modulo_id: 2, created_at: new Date(), updated_at: new Date() },
      { id: 7,  clave: 'roles.crear',              nombre: 'Crear roles',               descripcion: 'Crear nuevos roles dinámicamente',               modulo_id: 2, created_at: new Date(), updated_at: new Date() },
      { id: 8,  clave: 'roles.editar',              nombre: 'Editar roles',              descripcion: 'Editar roles existentes',                        modulo_id: 2, created_at: new Date(), updated_at: new Date() },
      { id: 9,  clave: 'roles.asignar_permisos',    nombre: 'Asignar permisos a roles',  descripcion: 'Gestionar qué permisos tiene cada rol',          modulo_id: 2, created_at: new Date(), updated_at: new Date() },

      // ── Módulo: Productos (modulo_id: 3) ────────────────────
      { id: 10, clave: 'productos.ver',            nombre: 'Ver productos',             descripcion: 'Ver catálogo de productos',                      modulo_id: 3, created_at: new Date(), updated_at: new Date() },
      { id: 11, clave: 'productos.crear',           nombre: 'Crear productos',           descripcion: 'Agregar productos al catálogo',                  modulo_id: 3, created_at: new Date(), updated_at: new Date() },
      { id: 12, clave: 'productos.editar',           nombre: 'Editar productos',          descripcion: 'Modificar productos existentes',                 modulo_id: 3, created_at: new Date(), updated_at: new Date() },
      { id: 13, clave: 'productos.eliminar',         nombre: 'Eliminar productos',        descripcion: 'Eliminar productos del catálogo',                modulo_id: 3, created_at: new Date(), updated_at: new Date() },

      // ── Módulo: Ferias (modulo_id: 4) ───────────────────────
      { id: 14, clave: 'ferias.ver',               nombre: 'Ver ferias',                descripcion: 'Ver listado de ferias',                          modulo_id: 4, created_at: new Date(), updated_at: new Date() },
      { id: 15, clave: 'ferias.gestionar',          nombre: 'Gestionar ferias',          descripcion: 'CRUD completo de ferias',                        modulo_id: 4, created_at: new Date(), updated_at: new Date() },

      // ── Módulo: Solicitudes (modulo_id: 5) ──────────────────
      { id: 16, clave: 'solicitudes.ver',          nombre: 'Ver solicitudes',           descripcion: 'Ver solicitudes de cambio de rol',               modulo_id: 5, created_at: new Date(), updated_at: new Date() },
      { id: 17, clave: 'solicitudes.crear',         nombre: 'Crear solicitud',           descripcion: 'Enviar solicitud para cambiar de rol',            modulo_id: 5, created_at: new Date(), updated_at: new Date() },
      { id: 18, clave: 'solicitudes.aprobar',        nombre: 'Aprobar solicitudes',       descripcion: 'Aprobar solicitudes de cambio de rol',            modulo_id: 5, created_at: new Date(), updated_at: new Date() },
      { id: 19, clave: 'solicitudes.rechazar',       nombre: 'Rechazar solicitudes',      descripcion: 'Rechazar solicitudes de cambio de rol',           modulo_id: 5, created_at: new Date(), updated_at: new Date() },

      // ── Módulo: Puestos (modulo_id: 6) ──────────────────────
      { id: 20, clave: 'puestos.ver',              nombre: 'Ver puestos',               descripcion: 'Ver puestos de productor',                       modulo_id: 6, created_at: new Date(), updated_at: new Date() },
      { id: 21, clave: 'puestos.crear',             nombre: 'Crear puesto',              descripcion: 'Registrar un puesto propio',                     modulo_id: 6, created_at: new Date(), updated_at: new Date() },
      { id: 22, clave: 'puestos.gestionar',          nombre: 'Gestionar puestos',         descripcion: 'CRUD completo de todos los puestos',             modulo_id: 6, created_at: new Date(), updated_at: new Date() },

      // ── Módulo: Recetas (modulo_id: 7) ──────────────────────
      { id: 23, clave: 'recetas.ver',              nombre: 'Ver recetas',               descripcion: 'Ver catálogo de recetas',                        modulo_id: 7, created_at: new Date(), updated_at: new Date() },
      { id: 24, clave: 'recetas.gestionar',          nombre: 'Gestionar recetas',         descripcion: 'CRUD completo de recetas',                       modulo_id: 7, created_at: new Date(), updated_at: new Date() },

      // ── Módulo: Proformas (modulo_id: 8) ────────────────────
      { id: 25, clave: 'proformas.ver',            nombre: 'Ver proformas',             descripcion: 'Ver proformas propias o todas',                  modulo_id: 8, created_at: new Date(), updated_at: new Date() },
      { id: 26, clave: 'proformas.crear',           nombre: 'Crear proformas',           descripcion: 'Crear nuevas proformas',                         modulo_id: 8, created_at: new Date(), updated_at: new Date() },

      // ── Módulo: Mensajes (modulo_id: 9) ─────────────────────
      { id: 27, clave: 'mensajes.ver',             nombre: 'Ver mensajes',              descripcion: 'Ver mensajes de contacto',                       modulo_id: 9, created_at: new Date(), updated_at: new Date() },
      { id: 28, clave: 'mensajes.gestionar',        nombre: 'Gestionar mensajes',        descripcion: 'Responder y eliminar mensajes',                  modulo_id: 9, created_at: new Date(), updated_at: new Date() },

      // ── Módulo: Auditoría (modulo_id: 10) ───────────────────
      { id: 29, clave: 'auditoria.ver',            nombre: 'Ver auditoría',             descripcion: 'Ver logs de auditoría del sistema',              modulo_id: 10, created_at: new Date(), updated_at: new Date() },

      // ── Módulo: Configuración (modulo_id: 11) ──────────────
      { id: 30, clave: 'configuracion.gestionar',  nombre: 'Gestionar configuración',   descripcion: 'Modificar configuración del sistema',            modulo_id: 11, created_at: new Date(), updated_at: new Date() },
    ];

    const existing = await queryInterface.sequelize.query(
      "SELECT id FROM `permisos`",
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    const existingIds = existing.map(p => p.id);
    const toInsert = permisos.filter(p => !existingIds.includes(p.id));

    if (toInsert.length > 0) {
      await queryInterface.bulkInsert('permisos', toInsert, {});
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('permisos', null, {});
  },
};
