// ============================================================
// Script de demostración: envía una solicitud de Productor con
// datos fraudulentos/incoherentes diseñados para PASAR el
// pre-check determinista pero que la IA (Groq) los rechace.
//
// USO:  node scripts/demo_ai_reject.js
//
// (script puntual, no se ejecuta en CI ni en el server)
// ============================================================
'use strict';
require('dotenv').config();

const BASE = process.env.DEMO_API_BASE || 'http://localhost:3002';
const EMAIL = 'ygarciafwd@gmail.com';
const PASSWORD = '12345678';

const tinyPngB64 =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9ZitkPgAAAAASUVORK5CYII=';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const main = async () => {
  // 1) LOGIN ────────────────────────────────────────────────
  const loginRes = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  const loginJson = await loginRes.json();
  if (!loginJson.success) throw new Error('Login falló: ' + loginJson.message);
  const setCookie = loginRes.headers.get('set-cookie') || '';
  const cookieMatch = setCookie.match(/agromap_token=([^;]+)/);
  if (!cookieMatch) throw new Error('No se obtuvo cookie agromap_token');
  const cookie = `agromap_token=${cookieMatch[1]}`;
  const user = loginJson.data.user;
  console.log(`[OK] Login: id=${user.id} rol=${user.role} email=${user.email}`);

  const auth = { 'Content-Type': 'application/json', Cookie: cookie };

  // 2) PAYLOAD FRAUDULENTO ───────────────────────────────────
  // Pasa todos los chequeos formales del preCheck, pero la IA
  // semántica debería detectar:
  //   - nombre obvio falso
  //   - dirección genérica ("casa") prohibida por el SYSTEM_PROMPT
  //   - descripción de un negocio NO agrícola
  //   - tipos_producto incoherentes con la descripción
  //   - finca y producción con gibberish/placeholders
  const datosExtendidos = {
    personal: {
      nombre: 'Pepito',
      primerApellido: 'Mentirilla',
      segundoApellido: 'Inventadísimo',
      cedula: '1-2345-6789',
      fechaNacimiento: '2000-01-15',
      genero: 'Masculino',
      nacionalidad: 'Costarricense',
      telefonoSecundario: '',
      provincia: 'San José',
      canton: 'Central',
      distrito: 'Carmen',
      direccionExacta: 'casa',
    },
    produccion: {
      nombreFinca: 'asdfasdf qwerty xx',
      tamanoFinca: 'test 9999 hectáreas',
      direccionFinca: 'por ahí',
      temporadasCosecha: 'cualquiera',
      produccionMensual: 'xxx',
      produccionOrganica: false,
      descripcionAgricola: 'prueba prueba prueba',
    },
    mag: {
      numeroRegistroMag: 'MAG-FAKE-0001',
      carnetFeriante: 'CF-0001',
      fechaEmisionMag: '2024-01-01',
      fechaVencimientoMag: '2028-01-01',
      comiteFeriaAsociada: 'Comité Test',
    },
    sanitario: {
      tieneManipulacionAlimentos: false,
      numeroCarnetManipulacion: '',
      fechaEmisionManipulacion: '',
      fechaVencimientoManipulacion: '',
      institucionEmisora: '',
      permisoMinisterioSalud: '',
      registroSenasa: '',
      tieneRefrigeracion: false,
      tipoRefrigeracion: '',
    },
    tributario: {
      numeroTributario: '999999999',
      regimenTributario: 'Régimen Simplificado',
    },
    solicitudFeria: {
      comiteAdministrador: 'X',
      tipoPuesto: 'fijo',
      dimensionesPuesto: '3m x 2m',
      requiereElectricidad: false,
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
      foto_carnet_mag: tinyPngB64,
      constancia_tributaria: tinyPngB64,
    },
    documentosNombres: {
      foto_carnet_mag: 'fake_mag.png',
      constancia_tributaria: 'fake_tributaria.png',
    },
  };

  const puestoData = {
    usuario_id: user.id,
    nombre_puesto: 'TechExpress Don Pepito',
    descripcion:
      'Vendemos iPhones reacondicionados, PlayStation 5, tablets Samsung y accesorios electrónicos importados. Reparación de celulares y consolas con garantía de 6 meses. No vendemos productos agrícolas.',
    ubicacion: ['Feria del Productor Zapote'],
    feria_id: 1,
    tipos_producto: ['Verduras', 'Frutas'],
    fotos_nombres: ['foto_falsa_1.jpg'],
    fotos_base64: [tinyPngB64],
    telefono: '88887777',
    email: user.email,
    horarios: 'Sábados 5 a 13',
    horarios_list: [{ dia: 'Sábado', inicio: '05:00', fin: '13:00' }],
    metodos_cultivo: 'test',
    redes_sociales: '@fakepepito',
    fecha_registro: new Date().toISOString(),
    datos_extendidos: datosExtendidos,
  };

  // Limpiar puestos previos de este usuario para evitar choque 1:1
  const prevRes = await fetch(`${BASE}/puestos/usuario/${user.id}`, { headers: { Cookie: cookie } });
  if (prevRes.ok) {
    const prevJson = await prevRes.json();
    const prev = prevJson.success ? prevJson.data : prevJson;
    if (prev && prev.id) {
      console.log(`[INFO] Ya existe puesto previo id=${prev.id}, se hará PUT en lugar de POST`);
      const putRes = await fetch(`${BASE}/puestos/${prev.id}`, {
        method: 'PUT', headers: auth, body: JSON.stringify(puestoData),
      });
      const putJson = await putRes.json();
      if (!putRes.ok) throw new Error('PUT puesto falló: ' + JSON.stringify(putJson));
      console.log(`[OK] Puesto actualizado id=${prev.id}`);
    }
  } else {
    const postRes = await fetch(`${BASE}/puestos`, {
      method: 'POST', headers: auth, body: JSON.stringify(puestoData),
    });
    const postJson = await postRes.json();
    if (!postRes.ok) throw new Error('POST puesto falló: ' + JSON.stringify(postJson));
    console.log(`[OK] Puesto creado id=${postJson.data?.id || postJson.id}`);
  }

  // 3) SOLICITUD CAMBIO ROL → dispara la revisión IA ────────
  const solicitudData = {
    usuarioId: user.id,
    nombreUsuario: 'Pepito Mentirilla Inventadísimo',
    nombreDelPuesto: puestoData.nombre_puesto,
    correoUsuario: user.email,
    rolSolicitado: 'Productor',
    estado: 'Pendiente',
    motivo_respuesta: '',
    fecha_solicitud: new Date().toISOString(),
  };
  const solRes = await fetch(`${BASE}/solicitudes`, {
    method: 'POST', headers: auth, body: JSON.stringify(solicitudData),
  });
  const solJson = await solRes.json();
  if (!solRes.ok) throw new Error('POST solicitud falló: ' + JSON.stringify(solJson));
  const sol = solJson.success ? solJson.data : solJson;
  console.log(`[OK] Solicitud creada id=${sol.id} estado=${sol.estado}`);

  // 4) ESPERAR A LA IA Y CONSULTAR DECISIÓN ─────────────────
  // El reviewer corre en setImmediate; damos margen de hasta 30s para
  // pre-check + llamada a Groq.
  const { sequelize } = require('../src/models');
  sequelize.options.logging = false;

  let estadoFinal = 'Pendiente';
  let motivo = null;
  for (let i = 0; i < 30; i++) {
    await sleep(1000);
    const [rows] = await sequelize.query(
      'SELECT estado, motivo_respuesta FROM solicitudes_cambio_rol WHERE id = ?',
      { replacements: [sol.id] }
    );
    if (rows[0] && rows[0].estado !== 'Pendiente') {
      estadoFinal = rows[0].estado;
      motivo = rows[0].motivo_respuesta;
      break;
    }
    process.stdout.write('.');
  }
  console.log('');
  console.log('─────────────────────────────────────────────');
  console.log(`Estado final de la solicitud #${sol.id}: ${estadoFinal}`);
  console.log(`Motivo IA: ${motivo || '(sin motivo registrado)'}`);
  console.log('─────────────────────────────────────────────');

  // 5) Último registro de auditoría asociado al usuario ────
  const [audits] = await sequelize.query(
    `SELECT accion, detalles, created_at FROM audit_logs
     WHERE usuario_id = ? AND recurso = 'solicitudes_cambio_rol'
     ORDER BY id DESC LIMIT 1`,
    { replacements: [user.id] }
  );
  if (audits[0]) {
    console.log('Auditoría:', audits[0].accion);
    try { console.log('Detalles:', JSON.parse(audits[0].detalles)); }
    catch { console.log('Detalles raw:', audits[0].detalles); }
  } else {
    console.log('(no se registró audit_log para esta solicitud)');
  }
  process.exit(0);
};

main().catch((e) => { console.error('FALLO:', e); process.exit(1); });
