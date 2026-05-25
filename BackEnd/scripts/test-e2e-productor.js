'use strict';
// Script E2E: simula que un usuario común (María) llena el formulario
// de RegistroProductor con datos realistas y ricos, dispara el flujo
// completo (puesto + solicitud) y espera la decisión de la IA.
require('dotenv').config({ path: __dirname + '/../.env' });

const BASE = 'http://localhost:3002';
const EMAIL = 'maria@usuario.com';
const PASSWORD = 'secret123';
// Correo donde queremos recibir la notificación
const CORREO_NOTIF = 'agromapcorp@gmail.com';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const fetchJson = async (url, opts = {}) => {
  const res = await fetch(url, {
    ...opts,
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
  });
  let body = null;
  try { body = await res.json(); } catch { body = null; }
  // Capturar Set-Cookie crudo (Node fetch lo expone como header simple separado por coma)
  const setCookie = res.headers.get('set-cookie');
  return { status: res.status, body, setCookie };
};

const extractTokenCookie = (setCookie) => {
  if (!setCookie) return null;
  const m = setCookie.match(/agromap_token=([^;,]+)/);
  return m ? m[1] : null;
};

(async () => {
  console.log('━━━ 1. LOGIN María ━━━');
  const login = await fetchJson(`${BASE}/auth/login`, {
    method: 'POST',
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  if (login.status !== 200) {
    console.error('LOGIN FAIL', login.status, login.body);
    process.exit(1);
  }
  const cookieToken = extractTokenCookie(login.setCookie);
  const token = login.body.token || login.body.data?.token || cookieToken;
  const userId = login.body.user?.id || login.body.data?.user?.id;
  console.log('OK token len=', token?.length, 'userId=', userId, 'fuente=', cookieToken ? 'cookie' : 'body');
  // Enviamos token tanto como Bearer (algunas rutas) como Cookie (rutas que usan cookie)
  const authH = {
    Authorization: `Bearer ${token}`,
    Cookie: `agromap_token=${token}`,
  };

  console.log('\n━━━ 2. Obtener puesto existente del usuario ━━━');
  const got = await fetchJson(`${BASE}/puestos/usuario/${userId}`, { headers: authH });
  let puestoId = got.body?.data?.id;
  console.log('puesto existente id=', puestoId, 'status=', got.status);

  // Una feria válida
  const ferias = await fetchJson(`${BASE}/ferias`);
  const feriaId = ferias.body?.data?.[0]?.id || 1;
  const feriaNombre = ferias.body?.data?.[0]?.nombre || 'Feria del Productor Zapote';
  console.log('feria seleccionada:', feriaId, feriaNombre);

  // ── Payload del puesto con datos RICOS y COHERENTES ─────────
  const puestoData = {
    usuario_id: userId,
    nombre_puesto: 'Verduras Orgánicas Finca La Esperanza',
    descripcion:
      'Venta directa al consumidor de verduras y hierbas aromáticas orgánicas, ' +
      'cosechadas semanalmente en finca familiar ubicada en San Diego de La Unión, Cartago. ' +
      'Más de 15 años de tradición agrícola, producción libre de agroquímicos sintéticos, ' +
      'con énfasis en lechuga romana, tomate cherry, culantro, perejil, albahaca y cebollín.',
    ubicacion: [feriaNombre],
    feria_id: feriaId,
    tipos_producto: ['Verduras', 'Hierbas'],
    fotos_nombres: ['puesto1.jpg', 'cosecha-lechuga.jpg'],
    fotos_base64: [
      // Pixel mínimo válido (la IA solo verifica cantidad, no contenido)
      'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/wAALCAABAAEBAREA/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAEBAAA/AKpgD//Z',
      'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/wAALCAABAAEBAREA/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAEBAAA/AKpgD//Z',
    ],
    telefono: '88887777',
    email: CORREO_NOTIF,
    horarios: 'Sábado de 06:00 a 12:00, Domingo de 06:00 a 11:00',
    horarios_list: [
      { dia: 'Sábado', inicio: '06:00', fin: '12:00' },
      { dia: 'Domingo', inicio: '06:00', fin: '11:00' },
    ],
    metodos_cultivo:
      'Agricultura orgánica certificada con rotación de cultivos, compost natural elaborado en finca, ' +
      'control biológico de plagas mediante insectos benéficos (mariquitas y crisopas), mulch orgánico y ' +
      'sistema de riego por goteo para optimizar uso del agua.',
    redes_sociales: '@verduras_la_esperanza',
    fecha_registro: new Date().toISOString(),
    datos_extendidos: {
      personal: {
        nombre: 'María',
        primerApellido: 'López',
        segundoApellido: 'Quesada',
        cedula: '1-1234-5678',
        fechaNacimiento: '1985-05-10',
        genero: 'Femenino',
        nacionalidad: 'Costarricense',
        telefonoSecundario: '',
        provincia: 'Cartago',
        canton: 'La Unión',
        distrito: 'San Diego',
        direccionExacta:
          '300 metros sur de la iglesia católica de San Diego, La Unión, Cartago. ' +
          'Casa color azul con portón blanco, frente al parque infantil.',
      },
      produccion: {
        nombreFinca: 'Finca La Esperanza',
        tamanoFinca: '2 hectáreas',
        direccionFinca: 'San Diego de La Unión, Cartago, 500m oeste del cementerio',
        temporadasCosecha: 'Cosecha continua todo el año, picos en verano (dic-abr)',
        produccionMensual: '350 kg promedio',
        produccionOrganica: true,
        descripcionAgricola:
          'Finca familiar de 2 hectáreas dedicada al cultivo intensivo de hortalizas de ciclo corto: ' +
          'lechuga romana, tomate cherry, cebolla blanca, culantro, perejil, albahaca y cebollín. ' +
          'Producción semanal estimada de 80-90 kg, con certificación orgánica vigente.',
      },
      mag: {
        numeroRegistroMag: 'MAG-CR-2019-04321',
        carnetFeriante: 'CF-2024-1234',
        fechaEmisionMag: '2019-03-15',
        fechaVencimientoMag: '2027-03-15',
        comiteFeriaAsociada: 'Comité de Feria de Cartago',
      },
      sanitario: {
        tieneManipulacionAlimentos: true,
        numeroCarnetManipulacion: 'MS-CR-2024-12345',
        fechaEmisionManipulacion: '2024-01-15',
        fechaVencimientoManipulacion: '2027-01-15',
        institucionEmisora: 'Ministerio de Salud de Costa Rica',
        permisoMinisterioSalud: 'PMS-CR-2024-00456',
        registroSenasa: 'SENASA-CR-2024-PROD-7890',
        tieneRefrigeracion: false,
        tipoRefrigeracion: '',
      },
      tributario: {
        numeroTributario: '3-101-456789',
        regimenTributario: 'Régimen Especial Agropecuario',
      },
      solicitudFeria: {
        comiteAdministrador: 'Comité de Feria de Cartago',
        tipoPuesto: 'Toldo',
        dimensionesPuesto: '3x3 metros',
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
        foto_carnet_mag: '/storage/docs/maria/carnet_mag.pdf',
        certificacion_productor: '/storage/docs/maria/certificacion.pdf',
        constancia_tributaria: '/storage/docs/maria/constancia.pdf',
        carnet_manipulacion: '/storage/docs/maria/manipulacion.pdf',
      },
      documentosNombres: {
        foto_carnet_mag: 'carnet_mag.pdf',
        certificacion_productor: 'certificacion.pdf',
        constancia_tributaria: 'constancia.pdf',
        carnet_manipulacion: 'manipulacion.pdf',
      },
    },
  };

  console.log('\n━━━ 3. PUT puesto con datos ricos ━━━');
  let puestoUpd;
  if (puestoId) {
    puestoUpd = await fetchJson(`${BASE}/puestos/${puestoId}`, {
      method: 'PUT',
      headers: authH,
      body: JSON.stringify(puestoData),
    });
  } else {
    puestoUpd = await fetchJson(`${BASE}/puestos`, {
      method: 'POST',
      headers: authH,
      body: JSON.stringify(puestoData),
    });
    puestoId = puestoUpd.body?.data?.id;
  }
  console.log('PUT/POST /puestos status=', puestoUpd.status, 'puestoId=', puestoId);
  if (puestoUpd.status >= 400) {
    console.error('FAIL puesto:', puestoUpd.body);
    process.exit(1);
  }

  console.log('\n━━━ 4. POST solicitud cambio rol → Productor ━━━');
  const sol = await fetchJson(`${BASE}/solicitudes`, {
    method: 'POST',
    headers: authH,
    body: JSON.stringify({
      usuarioId: userId,
      nombreUsuario: 'María López Quesada',
      nombreDelPuesto: puestoData.nombre_puesto,
      correoUsuario: CORREO_NOTIF,
      rolSolicitado: 'Productor',
      estado: 'Pendiente',
      motivo_respuesta: '',
      fecha_solicitud: new Date().toISOString(),
    }),
  });
  console.log('POST /solicitudes status=', sol.status, 'body=', JSON.stringify(sol.body));
  if (sol.status >= 400) {
    console.error('FAIL solicitud:', sol.body);
    process.exit(1);
  }
  const solicitudId = sol.body?.data?.id;
  console.log('solicitudId=', solicitudId);

  console.log('\n━━━ 5. Esperando 12s a que la IA decida (Groq + email + DB) ━━━');
  await sleep(12000);

  console.log('\n━━━ 6. Verificando resultado en BD ━━━');
  const { sequelize, SolicitudCambioRol, Usuario, AuditLog } = require('../src/models');
  const u = await Usuario.findOne({ where: { email: EMAIL }, raw: true });
  const s = await SolicitudCambioRol.findByPk(solicitudId, { raw: true });
  const logs = await AuditLog.findAll({
    where: { recurso_id: solicitudId },
    order: [['id', 'DESC']],
    raw: true,
    limit: 3,
  });
  console.log('roleId final de María:', u.roleId, u.roleId === 2 ? '✅ Productor' : '— sigue Usuario');
  console.log('Solicitud final:', { id: s?.id, estado: s?.estado, motivo: s?.motivo_respuesta?.slice(0, 200) });
  console.log('AuditLogs:');
  logs.forEach((l) => console.log('  ', l.accion, JSON.stringify(l.detalles)?.slice(0, 250)));
  await sequelize.close();
  process.exit(0);
})().catch((e) => {
  console.error('ERROR FATAL:', e.message);
  console.error(e.stack);
  process.exit(1);
});
