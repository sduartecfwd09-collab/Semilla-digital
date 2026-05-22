// ============================================================
// Service: Email
// Envoltorio fino sobre Nodemailer. Si no hay credenciales SMTP
// configuradas (env vars SMTP_*), cae a "modo dev" y muestra el
// mensaje en consola en vez de enviarlo. Esto permite probar el
// flujo de recuperación de contraseña sin un servidor SMTP real.
//
// Para activar el envío real en producción, definí en .env:
//   SMTP_HOST=smtp.gmail.com
//   SMTP_PORT=465
//   SMTP_SECURE=true
//   SMTP_USER=tu_cuenta@gmail.com
//   SMTP_PASS=clave_de_aplicacion_de_gmail
//   SMTP_FROM=AgroMap <tu_cuenta@gmail.com>
// ============================================================
const nodemailer = require('nodemailer');

let cachedTransporter = null;

const getTransporter = () => {
  if (!process.env.SMTP_HOST) return null;
  if (cachedTransporter) return cachedTransporter;
  cachedTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: String(process.env.SMTP_SECURE).toLowerCase() === 'true',
    auth: process.env.SMTP_USER ? {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    } : undefined,
  });
  return cachedTransporter;
};

/**
 * Envía un email. Si no hay SMTP configurado, lo imprime en consola
 * (útil para desarrollo local). Lanza si SMTP está configurado pero falla.
 */
const sendMail = async ({ to, subject, html, text }) => {
  const transporter = getTransporter();
  if (!transporter) {
    console.log('\n[emailService] (modo dev: SMTP no configurado)');
    console.log('  Para:', to);
    console.log('  Asunto:', subject);
    console.log('  Texto:', text || (html ? html.replace(/<[^>]+>/g, ' ').trim() : ''));
    console.log();
    return { dev: true };
  }
  return transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    html,
    text,
  });
};

module.exports = { sendMail };
