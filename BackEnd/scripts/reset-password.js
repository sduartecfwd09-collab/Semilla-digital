// ============================================================
// Script: reset-password
// Uso:
//   ADMIN_EMAIL=admin@agromap.com NEW_PASSWORD='SuperSecret123' \
//     node scripts/reset-password.js
//
// Reemplazo seguro del antiguo `reset-admin-pwd.js`: nunca usa
// una contraseña hardcodeada. Si faltan ADMIN_EMAIL o NEW_PASSWORD,
// aborta. No se acepta como contraseña "admin", "123", etc.
// ============================================================
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const bcrypt = require('bcrypt');
const { Usuario } = require('../src/models');

const WEAK_PASSWORDS = new Set([
  'admin', 'password', '12345678', 'qwertyui', 'agromap', 'test1234'
]);

async function run() {
  const email = process.env.ADMIN_EMAIL;
  const newPassword = process.env.NEW_PASSWORD;

  if (!email) {
    console.error('ADMIN_EMAIL es requerido. Ej: ADMIN_EMAIL=admin@agromap.com');
    process.exit(1);
  }
  if (!newPassword || newPassword.length < 8) {
    console.error('NEW_PASSWORD es requerido y debe tener al menos 8 caracteres.');
    process.exit(1);
  }
  if (WEAK_PASSWORDS.has(newPassword.toLowerCase())) {
    console.error('NEW_PASSWORD es demasiado débil. Usá una contraseña fuerte.');
    process.exit(1);
  }

  try {
    const hashed = await bcrypt.hash(newPassword, 10);
    const [updated] = await Usuario.update({ password: hashed }, { where: { email } });

    if (updated > 0) {
      console.log(`✅ Contraseña actualizada para ${email}`);
    } else {
      console.log(`❌ No se encontró ningún usuario con el correo ${email}`);
      process.exit(1);
    }
  } catch (error) {
    console.error('Error al restablecer contraseña:', error.message);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

run();
