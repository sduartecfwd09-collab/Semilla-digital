/**
 * Auditoría read-only sobre la BD viva para validar el documento
 * auditoria-literales-codigo-muerto.md antes de borrar nada.
 *
 * Verifica:
 *  1. Usuarios con rol 'Cliente' (debería ser 0).
 *  2. Existencia y volumen de tablas delivery_applications / delivery_application_documents.
 *  3. Valores distintos de vehicle_type en las tablas vivas.
 *  4. Roles legacy ('Vendedor', 'Comprador', 'Admin', 'Cliente') en tabla roles.
 *
 * Solo SELECTs. No modifica nada.
 */
const { sequelize } = require('../src/models');

async function tableExists(name) {
  const [rows] = await sequelize.query(
    "SELECT COUNT(*) AS c FROM information_schema.tables " +
    "WHERE table_schema = DATABASE() AND table_name = :name",
    { replacements: { name } }
  );
  return rows[0].c > 0;
}

(async () => {
  try {
    await sequelize.authenticate();

    // ── 1. Usuarios con rol 'Cliente' ─────────────────────────────────
    console.log('\n=== 1. Usuarios con role->nombre = "Cliente" ===');
    const [usuariosCliente] = await sequelize.query(
      "SELECT u.id, u.email, u.role_id, r.nombre AS rol " +
      "FROM usuarios u LEFT JOIN roles r ON r.id = u.role_id " +
      "WHERE r.nombre = 'Cliente'"
    );
    if (usuariosCliente.length === 0) {
      console.log('  ✅ 0 usuarios con rol "Cliente" (seguro de borrar el literal).');
    } else {
      console.log(`  ⚠️  ${usuariosCliente.length} usuarios con rol "Cliente":`);
      usuariosCliente.forEach(u => console.log(`     - id=${u.id} email=${u.email}`));
    }

    // ── 2. Tablas delivery_applications* ──────────────────────────────
    console.log('\n=== 2. Tablas delivery_applications / delivery_application_documents ===');
    const existsApp = await tableExists('delivery_applications');
    const existsDoc = await tableExists('delivery_application_documents');
    console.log(`  delivery_applications existe: ${existsApp}`);
    console.log(`  delivery_application_documents existe: ${existsDoc}`);

    if (existsApp) {
      const [[appCount]] = await sequelize.query('SELECT COUNT(*) AS c FROM delivery_applications');
      console.log(`  filas en delivery_applications: ${appCount.c}`);
      if (appCount.c > 0) {
        const [sample] = await sequelize.query(
          'SELECT id, user_id, vehicle_type, status, created_at ' +
          'FROM delivery_applications ORDER BY created_at DESC LIMIT 10'
        );
        console.log('  muestra (hasta 10):');
        sample.forEach(r => console.log(`     - id=${r.id} user=${r.user_id} vt=${r.vehicle_type} st=${r.status} at=${r.created_at}`));
      }
    }

    if (existsDoc) {
      const [[docCount]] = await sequelize.query('SELECT COUNT(*) AS c FROM delivery_application_documents');
      console.log(`  filas en delivery_application_documents: ${docCount.c}`);
    }

    // ── 3. vehicle_type real en las tablas vivas ──────────────────────
    console.log('\n=== 3. Valores reales de vehicle_type en tablas vivas ===');

    const existsSol = await tableExists('solicitudes_cambio_rol');
    if (existsSol) {
      const [solVt] = await sequelize.query(
        "SELECT vehicle_type, COUNT(*) AS total FROM solicitudes_cambio_rol " +
        "WHERE vehicle_type IS NOT NULL AND vehicle_type <> '' " +
        "GROUP BY vehicle_type ORDER BY total DESC"
      );
      console.log('  solicitudes_cambio_rol.vehicle_type:');
      if (solVt.length === 0) console.log('     (sin valores)');
      else solVt.forEach(v => console.log(`     - "${v.vehicle_type}" × ${v.total}`));
    } else {
      console.log('  ⚠️  Tabla solicitudes_cambio_rol no existe.');
    }

    const existsDrv = await tableExists('delivery_drivers');
    if (existsDrv) {
      const [drvVt] = await sequelize.query(
        "SELECT vehicle_type, COUNT(*) AS total FROM delivery_drivers " +
        "WHERE vehicle_type IS NOT NULL AND vehicle_type <> '' " +
        "GROUP BY vehicle_type ORDER BY total DESC"
      );
      console.log('  delivery_drivers.vehicle_type:');
      if (drvVt.length === 0) console.log('     (sin valores)');
      else drvVt.forEach(v => console.log(`     - "${v.vehicle_type}" × ${v.total}`));
    } else {
      console.log('  ⚠️  Tabla delivery_drivers no existe.');
    }

    // ── 4. Roles legacy en tabla roles ────────────────────────────────
    console.log('\n=== 4. Roles legacy en tabla roles ===');
    const [rolesLegacy] = await sequelize.query(
      "SELECT id, nombre FROM roles WHERE nombre IN ('Vendedor', 'Comprador', 'Cliente', 'Admin')"
    );
    if (rolesLegacy.length === 0) {
      console.log('  ✅ Ningún rol legacy (Vendedor/Comprador/Cliente/Admin) en tabla roles.');
    } else {
      console.log('  ⚠️  Roles legacy encontrados:');
      rolesLegacy.forEach(r => console.log(`     - id=${r.id} nombre="${r.nombre}"`));
    }

    // ── 5. Bonus: rol_solicitado legacy en solicitudes_cambio_rol ─────
    if (existsSol) {
      console.log('\n=== 5. rol_solicitado legacy en solicitudes_cambio_rol ===');
      const [rolSolLegacy] = await sequelize.query(
        "SELECT rol_solicitado, COUNT(*) AS total FROM solicitudes_cambio_rol " +
        "WHERE rol_solicitado IN ('Vendedor', 'Comprador', 'Cliente', 'Admin') " +
        "GROUP BY rol_solicitado"
      );
      if (rolSolLegacy.length === 0) {
        console.log('  ✅ Ningún rol_solicitado legacy en solicitudes_cambio_rol.');
      } else {
        rolSolLegacy.forEach(r => console.log(`     - "${r.rol_solicitado}" × ${r.total}`));
      }
    }

    console.log('\n✔ Auditoría completada.\n');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    if (err.original) console.error('original:', err.original.message);
    process.exit(1);
  }
})();
