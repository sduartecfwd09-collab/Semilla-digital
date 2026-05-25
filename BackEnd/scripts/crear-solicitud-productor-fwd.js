'use strict';
// Script para crear una solicitud de Productor con datos reales y fidedignos
// para el usuario fwdinvitado@gmail.com, simulando el proceso E2E.
require('dotenv').config({ path: __dirname + '/../.env' });

const BASE = 'http://localhost:3002';
const EMAIL = 'fwdinvitado@gmail.com';
const PASSWORD = 'Invitado123*';
const NOMBRE_COMPLETO = 'Francisco Javier Delgado Solís';

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
  console.log('━━━ [INICIO] ━━━');
  console.log('Conectando a base de datos para realizar limpieza inicial de pruebas anteriores...');
  const { sequelize, SolicitudCambioRol, PuestoProductor, Usuario, Role } = require('../src/models');
  
  // 1. Limpieza e idempotencia en Base de Datos
  const bcrypt = require('bcrypt');
  const userInDb = await Usuario.findOne({ where: { email: EMAIL } });
  if (userInDb) {
    console.log(`Usuario ${EMAIL} encontrado en BD. Reseteando contraseña, limpiando solicitudes y puesto antiguos...`);
    const hashedPassword = await bcrypt.hash(PASSWORD.trim(), 10);
    await userInDb.update({
      password: hashedPassword,
      name: NOMBRE_COMPLETO
    });
    
    await SolicitudCambioRol.destroy({ where: { usuario_id: userInDb.id } });
    await PuestoProductor.destroy({ where: { usuario_id: userInDb.id } });
    
    // Devolver al rol de 'Usuario' si fuera 'Productor'
    const roleUsuario = await Role.findOne({ where: { nombre: 'Usuario' } });
    if (roleUsuario && userInDb.roleId !== roleUsuario.id) {
      console.log(`Reestableciendo rol de Francisco a '${roleUsuario.nombre}'...`);
      await userInDb.update({ roleId: roleUsuario.id });
    }
  }

  // 2. Registro o Login del Usuario
  console.log('\n━━━ 1. LOGIN / REGISTRO del Invitado ━━━');
  let login = await fetchJson(`${BASE}/auth/login`, {
    method: 'POST',
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });

  if (login.status !== 200) {
    console.log(`El usuario ${EMAIL} no está registrado o cambió la clave. Intentando registrar nuevo usuario...`);
    const register = await fetchJson(`${BASE}/auth/register`, {
      method: 'POST',
      body: JSON.stringify({
        name: NOMBRE_COMPLETO,
        email: EMAIL,
        password: PASSWORD,
      }),
    });

    if (register.status !== 201) {
      console.error('ERROR AL REGISTRAR:', register.body);
      await sequelize.close();
      process.exit(1);
    }
    console.log('Usuario registrado con éxito!');
    login = await fetchJson(`${BASE}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
    });
  }

  if (login.status !== 200) {
    console.error('ERROR AL INICIAR SESIÓN:', login.body);
    await sequelize.close();
    process.exit(1);
  }

  const cookieToken = extractTokenCookie(login.setCookie);
  const token = login.body.token || login.body.data?.token || cookieToken;
  const userId = login.body.user?.id || login.body.data?.user?.id;
  console.log('Inicio de sesión exitoso! Token obtenido, ID de usuario:', userId);
  
  const authH = {
    Authorization: `Bearer ${token}`,
    Cookie: `agromap_token=${token}`,
  };

  // 3. Obtener feria válida
  const ferias = await fetchJson(`${BASE}/ferias`);
  const feriaId = ferias.body?.data?.[0]?.id || 1;
  const feriaNombre = ferias.body?.data?.[0]?.nombre || 'Feria del Productor de Heredia';
  console.log(`Feria seleccionada para la solicitud: ID: ${feriaId}, Nombre: "${feriaNombre}"`);

  // 4. Payload con datos sumamente reales y verídicos de Costa Rica
  const puestoData = {
    usuario_id: userId,
    nombre_puesto: 'Hortalizas y Frutas Orgánicas El Vergel',
    descripcion:
      'Cultivo y comercialización directa de lechugas, zanahorias, tomates y fresas 100% orgánicas. ' +
      'Cosechados con amor en nuestra finca familiar en Santo Domingo de Heredia, utilizando abonos naturales ' +
      'y control biológico de plagas, libre de pesticidas químicos sintéticos.',
    ubicacion: [feriaNombre],
    feria_id: feriaId,
    tipos_producto: ['Verduras', 'Frutas', 'Hierbas'],
    fotos_nombres: ['puesto-el-vergel.jpg', 'fresas-organicas.jpg'],
    fotos_base64: [
      'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/wAALCAABAAEBAREA/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAEBAAA/AKpgD//Z',
      'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/wAALCAABAAEBAREA/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAEBAAA/AKpgD//Z',
    ],
    telefono: '88995544',
    email: EMAIL,
    horarios: 'Sábado de 06:00 a 12:00',
    horarios_list: [
      { dia: 'Sábado', inicio: '06:00', fin: '12:00' },
    ],
    metodos_cultivo:
      'Uso exclusivo de abono compostado producido en la finca, control biológico de plagas con insectos benéficos ' +
      '(mariquitas, crisopas), rotación de cultivos para mantener la fertilidad natural del suelo y riego por goteo.',
    redes_sociales: '@hortalizas_el_vergel',
    fecha_registro: new Date().toISOString(),
    datos_extendidos: {
      personal: {
        nombre: 'Francisco',
        primerApellido: 'Delgado',
        segundoApellido: 'Solís',
        cedula: '1-0987-0654',
        fechaNacimiento: '1978-04-12',
        genero: 'Masculino',
        nacionalidad: 'Costarricense',
        telefonoSecundario: '',
        provincia: 'Heredia',
        canton: 'Santo Domingo',
        distrito: 'Santa Rosa',
        direccionExacta:
          '150 metros norte del salón comunal de Santa Rosa, casa de madera color café con portón de hierro negro, ' +
          'Santo Domingo, Heredia, Costa Rica.',
      },
      produccion: {
        nombreFinca: 'Finca El Vergel',
        tamanoFinca: '3.5 hectáreas',
        direccionFinca: 'Santa Rosa de Santo Domingo, Heredia, de la plaza de fútbol 300 metros este',
        temporadasCosecha: 'Cosecha continua durante todo el año, mayor abundancia en época seca (diciembre a abril)',
        produccionMensual: '500 kg promedio',
        produccionOrganica: true,
        descripcionAgricola:
          'Finca agrícola familiar dedicada al cultivo diversificado bajo sistema agroecológico de hortalizas, legumbres ' +
          'y frutas menores. Contamos con invernaderos para el control de humedad en época lluviosa.',
      },
      mag: {
        numeroRegistroMag: 'MAG-CR-2018-09512',
        carnetFeriante: 'CF-2023-8822',
        fechaEmisionMag: '2018-05-20',
        fechaVencimientoMag: '2028-05-20',
        comiteFeriaAsociada: 'Comité de Feria del Productor de Heredia',
      },
      sanitario: {
        tieneManipulacionAlimentos: true,
        numeroCarnetManipulacion: 'MS-CR-2024-99887',
        fechaEmisionManipulacion: '2024-05-10',
        fechaVencimientoManipulacion: '2029-05-10',
        institucionEmisora: 'Ministerio de Salud de Costa Rica',
        permisoMinisterioSalud: 'PMS-HER-2024-00129',
        registroSenasa: 'SENASA-HER-2024-PROD-4411',
        tieneRefrigeracion: false,
        tipoRefrigeracion: '',
      },
      tributario: {
        numeroTributario: '3-101-987654',
        regimenTributario: 'Régimen Especial Agropecuario',
      },
      solicitudFeria: {
        comiteAdministrador: 'Comité de Feria de Heredia',
        tipoPuesto: 'Toldo',
        dimensionsPuesto: '3x3 metros',
        requiereElectricidad: false,
        requiereAgua: true,
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
        foto_carnet_mag: '/storage/docs/fwdinvitado/carnet_mag.pdf',
        certificacion_productor: '/storage/docs/fwdinvitado/certificacion.pdf',
        constancia_tributaria: '/storage/docs/fwdinvitado/constancia.pdf',
        carnet_manipulacion: '/storage/docs/fwdinvitado/manipulacion.pdf',
      },
      documentosNombres: {
        foto_carnet_mag: 'carnet_mag.pdf',
        certificacion_productor: 'certificacion.pdf',
        constancia_tributaria: 'constancia.pdf',
        carnet_manipulacion: 'manipulacion.pdf',
      },
    },
  };

  // 5. Creación/Modificación de puesto de productor
  console.log('\n━━━ 2. GUARDAR puesto con datos verídicos ━━━');
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

  // 6. Creación de la Solicitud de Cambio de Rol a Productor
  console.log('\n━━━ 3. CREAR Solicitud de Cambio de Rol → Productor ━━━');
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

  // 7. Espera para que actúe la revisión automática con IA
  console.log('\n━━━ 4. Esperando 12s a que la IA decida la aprobación (Groq + Email) ━━━');
  await sleep(12000);

  // 8. Verificación de resultados finales en BD
  console.log('\n━━━ 5. Verificando resultados finales en la Base de Datos ━━━');
  const u = await Usuario.findOne({ where: { email: EMAIL }, include: [{ model: Role, as: 'rol' }] });
  const s = await SolicitudCambioRol.findByPk(solicitudId);
  const logs = await sequelize.models.AuditLog.findAll({
    where: { recurso_id: solicitudId },
    order: [['id', 'DESC']],
    limit: 3,
  });

  console.log(`Rol final de Francisco: ${u?.rol?.nombre || 'Usuario'} (ID del rol: ${u?.roleId})`);
  console.log(`Estado final de la solicitud #${solicitudId}: ${s?.estado}`);
  console.log(`Motivo de respuesta de la IA/Sistema:\n  "${s?.motivo_respuesta || 'Sin respuesta'}"`);
  
  if (logs.length > 0) {
    console.log('\nRegistros de auditoría generados:');
    logs.forEach((log) => {
      console.log(` - Acción: ${log.accion} | Detalles:`, JSON.stringify(log.detalles));
    });
  } else {
    console.log('\nNo se registraron entradas de auditoría para esta solicitud.');
  }

  await sequelize.close();
  console.log('\n━━━ [FIN DE LA PRUEBA] ━━━');
  process.exit(0);
})().catch(async (e) => {
  console.error('ERROR CRÍTICO EN SCRIPT:', e.message);
  console.error(e.stack);
  process.exit(1);
});
