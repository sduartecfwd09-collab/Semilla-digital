const { sequelize, Role, Permiso, RolePermiso, Usuario } = require('../src/models');

(async () => {
  try {
    await sequelize.authenticate();

    const roles = await Role.findAll({ order: [['id', 'ASC']] });
    console.log('\n=== TABLA roles ===');
    console.log('id | nombre          | descripcion');
    console.log('---+-----------------+---------------------------------------------');
    roles.forEach(r => {
      console.log(`${String(r.id).padEnd(2)} | ${String(r.nombre).padEnd(15)} | ${r.descripcion ?? ''}`);
    });

    console.log('\n=== Conteo de usuarios por rol ===');
    const [conteo] = await sequelize.query(
      "SELECT u.role_id, r.nombre AS rol_nombre, COUNT(*) AS total " +
      "FROM usuarios u LEFT JOIN roles r ON r.id = u.role_id " +
      "GROUP BY u.role_id, r.nombre ORDER BY u.role_id"
    );
    conteo.forEach(c => {
      console.log(`  roleId=${c.role_id ?? 'NULL'}  rol=${c.rol_nombre ?? '(sin rol)'}  total=${c.total}`);
    });

    console.log('\n=== Permisos por rol (tabla role_permiso) ===');
    for (const r of roles) {
      const rps = await RolePermiso.findAll({
        where: { role_id: r.id },
        include: [{ model: Permiso, as: 'permiso', attributes: ['clave'] }],
        order: [['permiso_id', 'ASC']],
      });
      console.log(`\n  [${r.id}] ${r.nombre}  →  ${rps.length} permiso(s)`);
      rps.forEach(rp => {
        console.log(`     - ${rp.permiso?.clave ?? `permiso_id=${rp.permiso_id}`}  (otorgado=${rp.otorgado})`);
      });
    }

    console.log('\n=== Valores distintos de rol_solicitado en solicitud_cambio_rol ===');
    const [solicitudes] = await sequelize.query(
      "SELECT rol_solicitado, COUNT(*) AS total FROM solicitudes_cambio_rol GROUP BY rol_solicitado"
    );
    if (solicitudes.length === 0) {
      console.log('  (no hay solicitudes)');
    } else {
      solicitudes.forEach(s => console.log(`  rol_solicitado="${s.rol_solicitado}"  total=${s.total}`));
    }

    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
