'use strict';
const bcrypt = require('bcrypt');

module.exports = {
  async up(queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash('secret123', 10);

    const usuarios = [
      {
        id: 1,
        name: 'Admin AgroMap',
        email: 'admin@agromap.com',
        password: hashedPassword,
        role_id: 1, // Administrador
        status: 'Activo',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 2,
        name: 'Juan Pérez',
        email: 'juan@productor.com',
        password: hashedPassword,
        role_id: 2, // Productor
        status: 'Activo',
        feria_id: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 3,
        name: 'Maria Lopez',
        email: 'maria@usuario.com',
        password: hashedPassword,
        role_id: 3, // Usuario
        status: 'Activo',
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    // Verificar usuarios ya existentes
    const existingUsuarios = await queryInterface.sequelize.query(
      'SELECT id FROM usuarios',
      { type: Sequelize.QueryTypes.SELECT }
    );
    const existingUsuarioIds = existingUsuarios.map(u => u.id);
    const usuariosToInsert = usuarios.filter(u => !existingUsuarioIds.includes(u.id));

    if (usuariosToInsert.length > 0) {
      await queryInterface.bulkInsert('usuarios', usuariosToInsert, {});
    }

    // ── Para cada Productor sembrado, crear su puesto + solicitud aprobada ──
    // Esto cumple el invariante "Productor implica al menos un puesto" que el
    // flujo de UI también debe respetar (ver solicitudCambioRolService.approve).
    // Sin esto, los productores seedeados quedan huérfanos: existen como rol
    // pero no aparecen en queries que joinean contra puestos_productor.
    const productoresSeed = usuarios.filter(u => u.role_id === 2);

    if (productoresSeed.length > 0) {
      const existingPuestos = await queryInterface.sequelize.query(
        'SELECT usuario_id FROM puestos_productor',
        { type: Sequelize.QueryTypes.SELECT }
      );
      const existingPuestoUserIds = existingPuestos.map(p => p.usuario_id);

      const puestosToInsert = productoresSeed
        .filter(p => !existingPuestoUserIds.includes(p.id))
        .map(p => ({
          usuario_id: p.id,
          feria_id: p.feria_id || null,
          nombre_puesto: `Puesto de ${p.name}`,
          descripcion: 'Puesto sembrado automáticamente (fixture de desarrollo)',
          fecha_registro: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        }));

      if (puestosToInsert.length > 0) {
        await queryInterface.bulkInsert('puestos_productor', puestosToInsert, {});
      }

      // ── Sembrar puesto_ferias: cada puesto queda autorizado en su feria principal ──
      // puesto_ferias es la fuente de verdad de autorización (Enfoque B). Sin esta
      // fila, productoService rechazaría las ofertas del propio productor en su feria.
      const puestosActuales = await queryInterface.sequelize.query(
        'SELECT id, usuario_id, feria_id FROM puestos_productor WHERE feria_id IS NOT NULL',
        { type: Sequelize.QueryTypes.SELECT }
      );
      const productorUserIds = productoresSeed.map(p => p.id);
      const puestosDeSeed = puestosActuales.filter(p => productorUserIds.includes(p.usuario_id));

      if (puestosDeSeed.length > 0) {
        const existingPuestoFerias = await queryInterface.sequelize.query(
          'SELECT puesto_id, feria_id FROM puesto_ferias',
          { type: Sequelize.QueryTypes.SELECT }
        );
        const existingKey = new Set(
          existingPuestoFerias.map(pf => `${pf.puesto_id}:${pf.feria_id}`)
        );

        const puestoFeriasToInsert = puestosDeSeed
          .filter(p => !existingKey.has(`${p.id}:${p.feria_id}`))
          .map(p => ({
            puesto_id: p.id,
            feria_id: p.feria_id,
            created_at: new Date(),
            updated_at: new Date(),
          }));

        if (puestoFeriasToInsert.length > 0) {
          await queryInterface.bulkInsert('puesto_ferias', puestoFeriasToInsert, {});
        }
      }

      const existingSolicitudes = await queryInterface.sequelize.query(
        "SELECT usuario_id FROM solicitudes_cambio_rol WHERE rol_solicitado = 'Productor'",
        { type: Sequelize.QueryTypes.SELECT }
      );
      const existingSolicitudUserIds = existingSolicitudes.map(s => s.usuario_id);

      const solicitudesToInsert = productoresSeed
        .filter(p => !existingSolicitudUserIds.includes(p.id))
        .map(p => ({
          usuario_id: p.id,
          nombre_usuario: p.name,
          nombre_del_puesto: `Puesto de ${p.name}`,
          correo_usuario: p.email,
          rol_solicitado: 'Productor',
          estado: 'Aprobada',
          fecha_solicitud: new Date(),
          fecha_respuesta: new Date(),
          motivo_respuesta: 'Aprobada automáticamente (fixture de desarrollo)',
          created_at: new Date(),
          updated_at: new Date(),
        }));

      if (solicitudesToInsert.length > 0) {
        await queryInterface.bulkInsert('solicitudes_cambio_rol', solicitudesToInsert, {});
      }
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('puesto_ferias', null, {});
    await queryInterface.bulkDelete('solicitudes_cambio_rol', null, {});
    await queryInterface.bulkDelete('puestos_productor', null, {});
    await queryInterface.bulkDelete('usuarios', null, {});
  }
};
