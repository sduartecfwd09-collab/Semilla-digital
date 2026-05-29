'use strict';
require('dotenv').config({ path: __dirname + '/../.env' });

const BASE = 'http://localhost:3002';
const EMAIL = 'ygarcia@gmail.com';
const PASSWORD = '12345678';
const NOMBRE_COMPLETO = 'Yolanda García Pérez';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const fetchJson = async (url, opts = {}) => {
  const res = await fetch(url, {
    ...opts,
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
  });
  let body = null;
  try { body = await res.json(); } catch { body = null; }
  const setCookie = res.headers.get('set-cookie');
  return { status: res.status, body, setCookie };
};

const extractTokenCookie = (setCookie) => {
  if (!setCookie) return null;
  const m = setCookie.match(/agromap_token=([^;,]+)/);
  return m ? m[1] : null;
};

(async () => {
  console.log('━━━ [INICIO DE PRUEBA DE AUTO-RECHAZO DE IA] ━━━');
  console.log('Estableciendo conexión con la base de datos...');
  const { sequelize, SolicitudCambioRol, PuestoProductor, Usuario, Role } = require('../src/models');
  
  // 1. Configurar y limpiar usuario y solicitudes viejas
  const bcrypt = require('bcrypt');
  let user = await Usuario.findOne({ where: { email: EMAIL } });
  
  if (!user) {
    console.log(`Usuario ${EMAIL} no encontrado. Buscando usuario alternativo ygarciafwd@gmail.com...`);
    const alternateUser = await Usuario.findOne({ where: { email: 'ygarciafwd@gmail.com' } });
    if (alternateUser) {
      console.log('Renombrando ygarciafwd@gmail.com a ygarcia@gmail.com y actualizando contraseña...');
      const hashedPassword = await bcrypt.hash(PASSWORD.trim(), 10);
      await alternateUser.update({
        email: EMAIL,
        name: NOMBRE_COMPLETO,
        password: hashedPassword,
        status: 'Activo'
      });
      user = alternateUser;
    } else {
      console.log('Creando un nuevo usuario ygarcia@gmail.com con el rol de Usuario...');
      const roleUsuario = await Role.findOne({ where: { nombre: 'Usuario' } });
      const hashedPassword = await bcrypt.hash(PASSWORD.trim(), 10);
      user = await Usuario.create({
        name: NOMBRE_COMPLETO,
        email: EMAIL,
        password: hashedPassword,
        roleId: roleUsuario ? roleUsuario.id : 3,
        status: 'Activo'
      });
    }
  } else {
    console.log(`Usuario ${EMAIL} encontrado en BD. Reseteando contraseña y datos...`);
    const hashedPassword = await bcrypt.hash(PASSWORD.trim(), 10);
    await user.update({
      password: hashedPassword,
      name: NOMBRE_COMPLETO,
      status: 'Activo'
    });
  }

  // Devolver al rol de 'Usuario'
  const roleUsuario = await Role.findOne({ where: { nombre: 'Usuario' } });
  if (roleUsuario && user.roleId !== roleUsuario.id) {
    console.log(`Reestableciendo rol de Yolanda a '${roleUsuario.nombre}' (ID: ${roleUsuario.id})...`);
    await user.update({ roleId: roleUsuario.id });
  }

  // Limpiar solicitudes y puesto antiguos
  await SolicitudCambioRol.destroy({ where: { usuario_id: user.id } });
  await PuestoProductor.destroy({ where: { usuario_id: user.id } });
  console.log('Limpieza completada.');

  // 2. Iniciar sesión vía API
  console.log('\n━━━ 1. AUTENTICACIÓN ━━━');
  console.log(`Iniciando sesión como ${EMAIL}...`);
  const login = await fetchJson(`${BASE}/auth/login`, {
    method: 'POST',
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });

  if (login.status !== 200) {
    console.error('ERROR AL INICIAR SESIÓN EN EL BACKEND:', login.body);
    await sequelize.close();
    process.exit(1);
  }

  const cookieToken = extractTokenCookie(login.setCookie);
  const token = login.body.token || login.body.data?.token || cookieToken;
  const userId = login.body.user?.id || login.body.data?.user?.id;
  console.log('¡Autenticado con éxito! ID de usuario obtenido:', userId);
  
  const authH = {
    Authorization: `Bearer ${token}`,
    Cookie: `agromap_token=${token}`,
  };

  // 3. Obtener feria
  const ferias = await fetchJson(`${BASE}/ferias`);
  const feriaId = ferias.body?.data?.[0]?.id || 1;
  const feriaNombre = ferias.body?.data?.[0]?.nombre || 'Feria del Productor de Heredia';

  // 4. Armar puesto con errores semánticos a propósito
  // Este payload pasa el preCheck (campos requeridos completos) pero fallará la IA
  // porque el negocio es una tienda de celulares y la dirección es falsa.
  const puestoData = {
    usuario_id: userId,
    nombre_puesto: 'Tienda ElectroVentas Express',
    descripcion:
      'Nos especializamos en la venta de celulares de última generación, cargadores rápidos, ' +
      'auriculares inalámbricos Bluetooth y repuestos electrónicos importados de China. ' +
      'Ofrecemos las mejores marcas del mercado a precios insuperables.',
    ubicacion: [feriaNombre],
    feria_id: feriaId,
    tipos_producto: ['Verduras', 'Frutas'], // Totalmente contradictorio con vender celulares
    fotos_nombres: ['imagen_puesto.jpg'],
    fotos_base64: [
      'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/wAALCAABAAEBAREA/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAEBAAA/AKpgD//Z'
    ],
    telefono: '88888888', // Válido para preCheck
    email: EMAIL,
    horarios: 'Sábado de 06:00 a 12:00',
    horarios_list: [
      { dia: 'Sábado', inicio: '06:00', fin: '12:00' },
    ],
    metodos_cultivo: 'No cultivamos nada. Toda nuestra mercadería es importada o adquirida en distribuidores mayoristas de electrónica.',
    redes_sociales: '@electroventas_express',
    fecha_registro: new Date().toISOString(),
    datos_extendidos: {
      personal: {
        nombre: 'Mickey',
        primerApellido: 'Mouse',
        segundoApellido: 'Pérez',
        cedula: '1-1234-5678', // Formato válido para preCheck
        fechaNacimiento: '1995-07-20', // Mayor de 18
        genero: 'Masculino',
        nacionalidad: 'Costarricense',
        telefonoSecundario: '',
        provincia: 'San José',
        canton: 'San José',
        distrito: 'Carmen',
        direccionExacta: 'Estación espacial en la Luna, tres cráteres a mano derecha, cerca del módulo Apolo 11.', // Dirección absurda
      },
      produccion: {
        nombreFinca: 'Finca Virtual Tech',
        tamanoFinca: '0 hectáreas',
        direccionFinca: 'No aplica, todo es digital',
        temporadasCosecha: 'No aplica',
        produccionMensual: '0 kg',
        produccionOrganica: false,
        descripcionAgricola: 'Venta de gadgets y accesorios.',
      },
      mag: {
        numeroRegistroMag: 'MAG-FAKE-9999',
        carnetFeriante: 'CF-FAKE-9999',
        fechaEmisionMag: '2020-01-01',
        fechaVencimientoMag: '2030-01-01',
        comiteFeriaAsociada: 'Comité Ficticio de la Luna',
      },
      sanitario: {
        tieneManipulacionAlimentos: false,
      },
      tributario: {
        numeroTributario: '3-101-123456',
        regimenTributario: 'Régimen Simplificado',
      },
      solicitudFeria: {
        comiteAdministrador: 'Comité Central',
        tipoPuesto: 'Toldo',
        dimensionsPuesto: '3x3 metros',
        requiereElectricidad: true,
        requiereAgua: false,
        aceptaReglamento: true,
        aceptaDerechoPiso: true,
      },
      calidad: {
        productoFresco: true,
        productoLimpio: true,
        librePlagas: true,
        empaqueAdecuado: true,
        etiquetadoCorrecto: true,
      },
      documentos: {
        foto_carnet_mag: '/storage/docs/ygarcia/carnet_fake.pdf',
        constancia_tributaria: '/storage/docs/ygarcia/constancia_fake.pdf',
      },
      documentosNombres: {
        foto_carnet_mag: 'carnet_fake.pdf',
        constancia_tributaria: 'constancia_fake.pdf',
      },
    },
  };

  console.log('\n━━━ 2. REGISTRAR PUESTO ficticio ━━━');
  const puestoUpd = await fetchJson(`${BASE}/puestos`, {
    method: 'POST',
    headers: authH,
    body: JSON.stringify(puestoData),
  });
  
  console.log('POST /puestos status =', puestoUpd.status);
  if (puestoUpd.status >= 400) {
    console.error('FAIL puesto:', puestoUpd.body);
    await sequelize.close();
    process.exit(1);
  }
  const puestoId = puestoUpd.body?.data?.id;
  console.log('Puesto registrado con ID:', puestoId);

  // 5. Crear solicitud de cambio de rol
  console.log('\n━━━ 3. CREAR SOLICITUD DE CAMBIO DE ROL ━━━');
  const sol = await fetchJson(`${BASE}/solicitudes`, {
    method: 'POST',
    headers: authH,
    body: JSON.stringify({
      usuarioId: userId,
      nombreUsuario: NOMBRE_COMPLETO,
      nombreDelPuesto: puestoData.nombre_puesto,
      correoUsuario: EMAIL,
      rolSolicitado: 'Productor',
      estado: 'Pendiente',
      motivo_respuesta: '',
      fecha_solicitud: new Date().toISOString(),
    }),
  });

  console.log('POST /solicitudes status =', sol.status);
  if (sol.status >= 400) {
    console.error('FAIL solicitud:', sol.body);
    await sequelize.close();
    process.exit(1);
  }
  const solicitudId = sol.body?.data?.id;
  console.log('Solicitud registrada con ID:', solicitudId);

  // 6. Esperar a que la IA actúe y decida el rechazo
  console.log('\n━━━ 4. ESPERANDO A QUE LA IA REVISE Y RECHAZE LA SOLICITUD (15 segundos) ━━━');
  await sleep(15000);

  // 7. Verificar resultados
  console.log('\n━━━ 5. RESULTADOS DE LA EVALUACIÓN DE IA ━━━');
  const u = await Usuario.findOne({ where: { email: EMAIL }, include: [{ model: Role, as: 'rol' }] });
  const s = await SolicitudCambioRol.findByPk(solicitudId);
  const logs = await sequelize.models.AuditLog.findAll({
    where: { recurso_id: solicitudId },
    order: [['id', 'DESC']],
    limit: 3,
  });

  console.log(`Rol final de Yolanda: ${u?.rol?.nombre || 'Usuario'} (ID del rol: ${u?.roleId})`);
  console.log(`Estado final de la solicitud #${solicitudId}: ${s?.estado}`);
  console.log(`Motivo de respuesta de la IA:\n  "${s?.motivo_respuesta || 'Sin respuesta'}"`);
  
  if (logs.length > 0) {
    console.log('\nEntradas de Auditoría (AuditLog):');
    logs.forEach((log) => {
      console.log(` - Acción: ${log.accion} | Detalles:`, JSON.stringify(log.detalles));
    });
  } else {
    console.log('\nNo se encontraron registros de auditoría.');
  }

  await sequelize.close();
  console.log('\n━━━ [FIN DE LA PRUEBA DE AUTO-RECHAZO DE IA] ━━━');
  process.exit(0);
})().catch(async (e) => {
  console.error('ERROR CRÍTICO EN SCRIPT:', e.message);
  console.error(e.stack);
  process.exit(1);
});
