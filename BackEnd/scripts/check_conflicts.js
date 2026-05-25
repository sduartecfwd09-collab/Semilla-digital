const models = require('../src/models');
const { sequelize, Usuario, Role, PuestoProductor, Producto, OfertaProducto, Feria, SolicitudCambioRol } = models;

async function checkConflicts() {
  console.log('=== INICIANDO DIAGNÓSTICO DE CONFLICTOS EN LA BASE DE DATOS ===\n');
  let conflictsFound = 0;

  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida correctamente.');

    // 1. Verificar consistencia de Roles en los Usuarios
    console.log('\n--- 1. Verificando consistencia de Roles ---');
    const roles = await Role.findAll();
    const roleIds = new Set(roles.map(r => r.id));
    const roleMap = {};
    roles.forEach(r => { roleMap[r.id] = r.nombre; });

    const usuarios = await Usuario.findAll();
    for (const u of usuarios) {
      if (!u.roleId) {
        console.warn(`⚠️ ALERTA: El usuario "${u.email}" (ID: ${u.id}) no tiene roleId asignado.`);
        conflictsFound++;
      } else if (!roleIds.has(u.roleId)) {
        console.error(`❌ CONFLICTO: El usuario "${u.email}" (ID: ${u.id}) tiene roleId=${u.roleId}, pero ese Rol no existe en la tabla 'roles'.`);
        conflictsFound++;
      }
    }

    // 2. Verificar consistencia entre Rol 'Productor' y PuestoProductor (relación 1:1)
    console.log('\n--- 2. Verificando consistencia de Productores y Puestos ---');
    const puestos = await PuestoProductor.findAll();
    const puestoUserIds = new Set(puestos.map(p => p.usuario_id));
    
    // Check A: Usuarios con Rol Productor pero sin Puesto
    const productorRole = roles.find(r => r.nombre === 'Productor');
    if (productorRole) {
      const productores = usuarios.filter(u => u.roleId === productorRole.id);
      console.log(`Info: Hay ${productores.length} usuarios con rol 'Productor' registrado.`);
      for (const prod of productores) {
        if (!puestoUserIds.has(prod.id)) {
          console.warn(`⚠️ INCONSISTENCIA: El usuario "${prod.name}" (ID: ${prod.id}) tiene rol 'Productor', pero NO tiene un Puesto registrado en la tabla 'puestos_productor'.`);
          conflictsFound++;
        }
      }
    } else {
      console.error("❌ CONFLICTO: No existe el rol 'Productor' en la tabla de roles.");
      conflictsFound++;
    }

    // Check B: Puestos que apuntan a usuarios que NO son Productores o no existen
    const userMap = {};
    usuarios.forEach(u => { userMap[u.id] = u; });

    for (const p of puestos) {
      const u = userMap[p.usuario_id];
      if (!u) {
        console.error(`❌ CONFLICTO CRÍTICO: El puesto "${p.nombre_puesto}" (ID: ${p.id}) está huérfano, apunta al usuario_id=${p.usuario_id} que NO existe.`);
        conflictsFound++;
      } else if (productorRole && u.roleId !== productorRole.id) {
        const actualRoleName = roleMap[u.roleId] || 'Desconocido';
        console.warn(`⚠️ INCONSISTENCIA: El puesto "${p.nombre_puesto}" (ID: ${p.id}) pertenece al usuario "${u.email}" (ID: ${u.id}), pero este usuario tiene el rol "${actualRoleName}" en lugar de "Productor".`);
        conflictsFound++;
      }
    }

    // 3. Verificar consistencia de Ofertas de Productos
    console.log('\n--- 3. Verificando consistencia de Ofertas y Productos ---');
    const ofertas = await OfertaProducto.findAll();
    const productos = await Producto.findAll();
    const productoIds = new Set(productos.map(p => p.id));
    const ferias = await Feria.findAll();
    const feriasIds = new Set(ferias.map(f => f.id));

    // Check A: Ofertas huérfanas
    for (const o of ofertas) {
      if (!productoIds.has(o.producto_id)) {
        console.error(`❌ CONFLICTO CRÍTICO: Oferta ID: ${o.id} apunta al producto_id=${o.producto_id} que NO existe.`);
        conflictsFound++;
      }
      if (!feriasIds.has(o.feria_id)) {
        console.error(`❌ CONFLICTO CRÍTICO: Oferta ID: ${o.id} apunta a la feria_id=${o.feria_id} que NO existe.`);
        conflictsFound++;
      }
    }

    // Check B: Ofertas duplicadas (mismo producto en misma feria)
    const ofertasKeyMap = {};
    for (const o of ofertas) {
      const key = `${o.producto_id}-${o.feria_id}`;
      if (ofertasKeyMap[key]) {
        console.error(`❌ CONFLICTO DUPLICADO: Hay múltiples ofertas registradas para el producto_id=${o.producto_id} en la feria_id=${o.feria_id}.`);
        conflictsFound++;
      } else {
        ofertasKeyMap[key] = true;
      }
    }

    // 4. Verificar Solicitudes de cambio de rol
    console.log('\n--- 4. Verificando solicitudes de cambio de rol ---');
    const solicitudes = await SolicitudCambioRol.findAll();
    for (const s of solicitudes) {
      const u = userMap[s.usuario_id];
      if (s.usuario_id && !u) {
        console.error(`❌ CONFLICTO CRÍTICO: La solicitud ID: ${s.id} apunta a un usuario_id=${s.usuario_id} inexistente.`);
        conflictsFound++;
      }
    }

    console.log('\n=== RESULTADO DEL DIAGNÓSTICO ===');
    if (conflictsFound === 0) {
      console.log('✅ EXCELENTE: ¡No se encontraron conflictos ni inconsistencias en la base de datos!');
    } else {
      console.log(`⚠️ DIAGNÓSTICO COMPLETADO: Se encontraron ${conflictsFound} advertencias/conflictos que podrían requerir atención.`);
    }

    process.exit(0);
  } catch (err) {
    console.error('Error durante el chequeo de conflictos:', err);
    process.exit(1);
  }
}

checkConflicts();
