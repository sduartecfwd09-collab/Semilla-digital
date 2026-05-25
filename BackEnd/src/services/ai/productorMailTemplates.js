// ============================================================
// Plantillas de email para decisiones automáticas de Productor
// Devuelve { subject, html, text } listo para emailService.sendMail
// ============================================================
'use strict';

const escape = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const baseWrapper = (titulo, contenido) => `
<!doctype html>
<html lang="es"><head><meta charset="utf-8"><title>${escape(titulo)}</title></head>
<body style="margin:0;padding:0;background:#f4f7f4;font-family:Arial,Helvetica,sans-serif;color:#1f2d1f;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7f4;padding:24px 0;">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.06);">
        <tr><td style="background:#2d7a2d;color:#ffffff;padding:20px 28px;font-size:20px;font-weight:bold;">
          🌱 AgroMap
        </td></tr>
        <tr><td style="padding:28px;line-height:1.55;font-size:15px;">
          ${contenido}
        </td></tr>
        <tr><td style="padding:18px 28px;border-top:1px solid #e6ece6;background:#fafcfa;color:#6b7c6b;font-size:12px;">
          Este mensaje fue generado automáticamente por el sistema de validación de AgroMap.
          Si crees que es un error, contactá al administrador.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

const aprobado = ({ nombre, resumen }) => {
  const safeNombre = escape(nombre || 'Aplicante');
  const safeResumen = escape(resumen || 'Tu solicitud cumple con todos los requisitos.');
  const subject = '✅ Tu solicitud de Productor fue aprobada — AgroMap';
  const html = baseWrapper(subject, `
    <h2 style="margin:0 0 12px;color:#2d7a2d;">¡Felicitaciones, ${safeNombre}!</h2>
    <p>Tu solicitud para convertirte en <b>Productor</b> en AgroMap fue <b style="color:#2d7a2d;">APROBADA</b> tras la revisión automática.</p>
    <p style="background:#eef7ee;border-left:4px solid #2d7a2d;padding:12px 14px;border-radius:6px;margin:18px 0;">
      ${safeResumen}
    </p>
    <p>Ya podés ingresar a tu cuenta con tus credenciales y empezar a gestionar tu puesto y productos.</p>
    <p style="margin-top:24px;">Gracias por sumarte a la comunidad agrícola.</p>
  `);
  const text = [
    `Hola ${nombre || 'Aplicante'},`,
    '',
    'Tu solicitud para convertirte en Productor en AgroMap fue APROBADA tras la revisión automática.',
    '',
    resumen || 'Tu solicitud cumple con todos los requisitos.',
    '',
    'Ya podés ingresar a tu cuenta y empezar a gestionar tu puesto y productos.',
    '',
    '— AgroMap',
  ].join('\n');
  return { subject, html, text };
};

const rechazado = ({ nombre, faltantes = [], resumen }) => {
  const safeNombre = escape(nombre || 'Aplicante');
  const safeResumen = escape(resumen || 'Tu solicitud no cumple con todos los requisitos exigidos.');
  const lista = faltantes.length > 0
    ? `<ul style="margin:10px 0 0;padding-left:22px;">${faltantes.map((f) => `<li>${escape(f)}</li>`).join('')}</ul>`
    : '<p style="margin:8px 0 0;">No se proporcionaron motivos específicos.</p>';
  const subject = '❌ Tu solicitud de Productor fue rechazada — AgroMap';
  const html = baseWrapper(subject, `
    <h2 style="margin:0 0 12px;color:#a33;">Hola ${safeNombre},</h2>
    <p>Tu solicitud para convertirte en <b>Productor</b> en AgroMap fue <b style="color:#a33;">RECHAZADA</b> tras la revisión automática.</p>
    <p style="background:#fdecec;border-left:4px solid #a33;padding:12px 14px;border-radius:6px;margin:18px 0;">
      ${safeResumen}
    </p>
    <p><b>Motivos detectados:</b></p>
    ${lista}
    <p style="margin-top:22px;">Podés revisar y corregir los puntos indicados, y volver a enviar tu solicitud desde tu perfil.</p>
  `);
  const text = [
    `Hola ${nombre || 'Aplicante'},`,
    '',
    'Tu solicitud para convertirte en Productor en AgroMap fue RECHAZADA tras la revisión automática.',
    '',
    resumen || 'Tu solicitud no cumple con todos los requisitos exigidos.',
    '',
    'Motivos detectados:',
    ...(faltantes.length > 0 ? faltantes.map((f) => `  - ${f}`) : ['  (sin detalle)']),
    '',
    'Podés corregir lo indicado y volver a enviar la solicitud desde tu perfil.',
    '',
    '— AgroMap',
  ].join('\n');
  return { subject, html, text };
};

module.exports = { aprobado, rechazado };
