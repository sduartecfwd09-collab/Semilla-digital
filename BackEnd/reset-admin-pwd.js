const bcrypt = require('bcrypt');
const { Usuario } = require('./src/models');

async function resetAdminPassword() {
  try {
    const adminEmail = 'admin@agromap.com';
    const newPassword = 'admin'; // A simple password for testing
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    const result = await Usuario.update(
      { password: hashedPassword },
      { where: { email: adminEmail } }
    );

    if (result[0] > 0) {
      console.log(`✅ Contraseña restablecida con éxito para ${adminEmail}`);
      console.log(`Nueva contraseña: ${newPassword}`);
    } else {
      console.log(`❌ No se encontró ningún usuario con el correo ${adminEmail}`);
    }
  } catch (error) {
    console.error('Error al restablecer contraseña:', error);
  } finally {
    process.exit(0);
  }
}

resetAdminPassword();
