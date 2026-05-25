// ============================================================
// Service: ProductorValidator
// Reglas deterministas + análisis semántico con Groq para
// solicitudes de cambio de rol a Productor.
//
// Devuelve siempre: { aprobado: bool, faltantes: string[], resumen: string }
// ============================================================
'use strict';
const groq = require('./groqService');

const TIPOS_SANITARIO_EXTRA = [
  'Lácteos', 'Carnes', 'Mariscos', 'Embutidos', 'Miel', 'Productos procesados',
];

const PROVINCIAS_CR = [
  'San José', 'Alajuela', 'Cartago', 'Heredia',
  'Guanacaste', 'Puntarenas', 'Limón',
];

// Cédula CR física (1-9999-9999) o residencia (10–12 dígitos)
const CEDULA_RE = /^(\d{1}-?\d{4}-?\d{4}|\d{10,12})$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TEL_CR_RE = /^\d{8}$/;

const calcularEdad = (fechaIso) => {
  if (!fechaIso) return null;
  const d = new Date(fechaIso);
  if (Number.isNaN(d.getTime())) return null;
  const hoy = new Date();
  let edad = hoy.getFullYear() - d.getFullYear();
  const m = hoy.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < d.getDate())) edad--;
  return edad;
};

/**
 * Pre-check determinista. Devuelve lista de faltantes (vacía si OK).
 * Evita gastar tokens de IA si hay errores estructurales obvios.
 */
const preCheck = ({ solicitud, puesto }) => {
  const faltantes = [];

  if (!puesto) {
    faltantes.push('No se encontró el puesto del productor asociado al usuario');
    return faltantes;
  }

  const datos = puesto.datosExtendidos || puesto.datos_extendidos || {};
  const p = datos.personal || {};
  const sf = datos.solicitudFeria || {};
  const sanitario = datos.sanitario || {};

  // ── Identidad personal ─────────────────────────
  if (!p.nombre || !String(p.nombre).trim()) faltantes.push('Nombre');
  if (!p.primerApellido || !String(p.primerApellido).trim()) faltantes.push('Primer apellido');
  if (!p.cedula || !CEDULA_RE.test(String(p.cedula).trim())) {
    faltantes.push('Cédula válida (formato 1-XXXX-XXXX o residencia 10-12 dígitos)');
  }
  const edad = calcularEdad(p.fechaNacimiento);
  if (edad === null) faltantes.push('Fecha de nacimiento');
  else if (edad < 18) faltantes.push('Mayoría de edad (18+)');

  // ── Ubicación ──────────────────────────────────
  if (!p.provincia || !PROVINCIAS_CR.includes(String(p.provincia).trim())) {
    faltantes.push('Provincia válida de Costa Rica');
  }
  if (!p.direccionExacta || !String(p.direccionExacta).trim()) faltantes.push('Dirección exacta');

  // ── Datos del puesto ───────────────────────────
  if (!puesto.nombrePuesto || !String(puesto.nombrePuesto).trim()) faltantes.push('Nombre del puesto');
  if (!puesto.descripcion || String(puesto.descripcion).trim().length < 10) {
    faltantes.push('Descripción del puesto (mínimo 10 caracteres)');
  }
  if (!puesto.feriaId) faltantes.push('Feria asociada');
  if (!Array.isArray(puesto.tiposProducto) || puesto.tiposProducto.length === 0) {
    faltantes.push('Al menos un tipo de producto');
  }
  if (!Array.isArray(puesto.fotosBase64) || puesto.fotosBase64.length === 0) {
    if (!Array.isArray(puesto.fotosNombres) || puesto.fotosNombres.length === 0) {
      faltantes.push('Al menos una foto del puesto');
    }
  }
  if (!puesto.telefono || !TEL_CR_RE.test(String(puesto.telefono).trim())) {
    faltantes.push('Teléfono CR de 8 dígitos');
  }
  if (!puesto.email || !EMAIL_RE.test(String(puesto.email).trim())) {
    faltantes.push('Email válido');
  }

  // ── Aceptaciones obligatorias ──────────────────
  if (!sf.aceptaReglamento) faltantes.push('Aceptación del reglamento');
  if (!sf.aceptaDerechoPiso) faltantes.push('Aceptación del derecho de piso');

  // ── Documentos según tipo de producto ──────────
  const docs = datos.documentos || {};
  const tieneCertificacion = !!(docs.foto_carnet_mag || docs.certificacion_productor);
  if (!tieneCertificacion) {
    faltantes.push('Documento de carnet MAG o certificación de productor');
  }
  if (!docs.constancia_tributaria) {
    faltantes.push('Constancia tributaria');
  }
  const requiereSanitario = (puesto.tiposProducto || []).some((t) => TIPOS_SANITARIO_EXTRA.includes(t));
  if (requiereSanitario) {
    if (!sanitario.tieneManipulacionAlimentos || !docs.carnet_manipulacion) {
      faltantes.push('Carnet de manipulación de alimentos (obligatorio para lácteos/carnes/mariscos/embutidos/miel/procesados)');
    }
  }

  // ── Correo de notificación presente ────────────
  if (!solicitud.correoUsuario && !solicitud.correo_usuario) {
    faltantes.push('Correo de contacto en la solicitud');
  }

  return faltantes;
};

/**
 * Construye el payload de datos enviado al LLM, omitiendo binarios pesados.
 */
const armarPayloadParaIA = ({ solicitud, puesto }) => {
  const datos = puesto?.datosExtendidos || puesto?.datos_extendidos || {};
  const docs = datos.documentos || {};
  const docsPresentes = Object.keys(docs).filter((k) => !!docs[k]);

  return {
    solicitud: {
      id: solicitud.id,
      rol_solicitado: solicitud.rolSolicitado || solicitud.rol_solicitado,
      nombre_del_puesto: solicitud.nombreDelPuesto || solicitud.nombre_del_puesto,
      correo: solicitud.correoUsuario || solicitud.correo_usuario,
    },
    puesto: {
      nombre: puesto?.nombrePuesto,
      descripcion: puesto?.descripcion,
      tipos_producto: puesto?.tiposProducto,
      telefono: puesto?.telefono,
      email: puesto?.email,
      horarios: puesto?.horarios,
      metodos_cultivo: puesto?.metodosCultivo,
      cantidad_fotos: Array.isArray(puesto?.fotosBase64) ? puesto.fotosBase64.length
        : Array.isArray(puesto?.fotosNombres) ? puesto.fotosNombres.length : 0,
    },
    personal: datos.personal || {},
    produccion: datos.produccion || {},
    mag: datos.mag || {},
    sanitario: { ...(datos.sanitario || {}), documentos_sanitarios_presentes: !!docs.carnet_manipulacion },
    tributario: datos.tributario || {},
    solicitudFeria: datos.solicitudFeria || {},
    calidad: datos.calidad || {},
    documentos_subidos: docsPresentes,
  };
};

// ============================================================
// SYSTEM PROMPT — analista estricto
// ============================================================
const SYSTEM_PROMPT = `Eres un analista de validación EXTREMADAMENTE ESTRICTO de solicitudes para convertirse en "Productor" de una feria del agro en Costa Rica. Tu única función es revisar formularios de aplicantes y decidir si cumplen ABSOLUTAMENTE TODOS los requisitos.

REGLA DE ORO: Si CUALQUIER requisito no se cumple, está vacío, es inconsistente, parece falso, es texto sin sentido (gibberish), o no corresponde a una actividad agrícola/ganadera/apícola real → la solicitud es RECHAZADA. No aceptas solicitudes con "casi todo bien". Tu respuesta debe ser binaria: cumple TODO o no.

CRITERIOS DE VALIDACIÓN OBLIGATORIOS:
1. Identidad: nombre, apellidos, cédula y fecha de nacimiento presentes y coherentes (mayor de 18).
2. Ubicación: provincia válida de Costa Rica (San José, Alajuela, Cartago, Heredia, Guanacaste, Puntarenas, Limón) y dirección concreta (no genérica como "casa" o "centro").
3. Puesto: nombre claro, descripción coherente con actividad agrícola (NO debe ser gibberish, texto aleatorio, palabras sueltas, ni descripción de un negocio NO agrícola como tienda de ropa, electrónica, etc.).
4. Tipos de producto: al menos uno y debe ser coherente con la descripción y el nombre de la finca.
5. Contacto: teléfono CR de 8 dígitos y email con formato válido.
6. Documentos: carnet MAG o certificación de productor + constancia tributaria. Si vende lácteos/carnes/mariscos/embutidos/miel/procesados → carnet manipulación alimentos OBLIGATORIO.
7. Aceptaciones legales: reglamento y derecho de piso aceptados (true).
8. Coherencia general: provincia declarada vs dirección, tipo de producto vs descripción, finca vs producción.
9. Detección de fraude: descripciones idénticas a placeholders ("test", "asdf", "prueba", "xxx"), nombres falsos obvios, datos contradictorios → RECHAZAR.

FORMATO DE SALIDA OBLIGATORIO (JSON estricto, sin texto adicional, sin markdown):
{
  "aprobado": boolean,
  "faltantes": ["lista concreta de motivos por los cuales se rechaza, vacío si aprobado"],
  "resumen": "una oración corta y profesional en español explicando la decisión"
}

NO escribas explicaciones fuera del JSON. NO uses markdown. NO inventes campos. Si dudas, RECHAZA.`;

const armarUserPrompt = (payload) =>
  `Revisa esta solicitud de Productor y responde SOLO con el JSON especificado:\n\n${JSON.stringify(payload, null, 2)}`;

/**
 * Parsea con tolerancia la respuesta del modelo a la estructura esperada.
 */
const parsearRespuestaIA = (raw) => {
  let texto = String(raw || '').trim();
  // Limpia fences de markdown por si el modelo los agrega pese al response_format
  texto = texto.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  let obj;
  try {
    obj = JSON.parse(texto);
  } catch {
    // Intento de extracción del primer bloque JSON balanceado
    const m = texto.match(/\{[\s\S]*\}/);
    if (!m) throw new Error('Respuesta IA no es JSON válido');
    obj = JSON.parse(m[0]);
  }
  const aprobado = typeof obj.aprobado === 'boolean' ? obj.aprobado : false;
  const faltantes = Array.isArray(obj.faltantes) ? obj.faltantes.map(String) : [];
  const resumen = typeof obj.resumen === 'string' && obj.resumen.trim()
    ? obj.resumen.trim()
    : (aprobado ? 'Solicitud aprobada por validación automática.' : 'Solicitud rechazada por validación automática.');
  return { aprobado, faltantes, resumen };
};

/**
 * Pipeline completo: pre-check determinista + IA.
 * Si el pre-check falla, rechaza sin invocar la IA (ahorra cuota).
 */
const revisarCompleto = async ({ solicitud, puesto }) => {
  const faltantesDeterministas = preCheck({ solicitud, puesto });
  if (faltantesDeterministas.length > 0) {
    return {
      aprobado: false,
      faltantes: faltantesDeterministas,
      resumen: 'Faltan datos o requisitos formales obligatorios.',
      origen: 'pre-check',
    };
  }

  const payload = armarPayloadParaIA({ solicitud, puesto });
  const content = await groq.chat({
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: armarUserPrompt(payload) },
    ],
    json: true,
    temperature: 0,
    maxTokens: 800,
  });
  const decision = parsearRespuestaIA(content);
  return { ...decision, origen: 'ia' };
};

module.exports = {
  preCheck,
  armarPayloadParaIA,
  parsearRespuestaIA,
  revisarCompleto,
  SYSTEM_PROMPT,
};
