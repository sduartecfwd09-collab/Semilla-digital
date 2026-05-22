// ============================================================
// Script: check_db
// Uso: node scripts/check_db.js
// Verifica que la BD esté accesible y muestra un resumen de
// usuarios y provincias.
// ============================================================
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { Usuario, Provincia, Role, sequelize } = require('../src/models');

async function check() {
  try {
    await sequelize.authenticate();
    const usuarios = await Usuario.findAll({ include: [{ model: Role, as: 'rol' }] });
    console.log(`\nUsuarios en la BD: ${usuarios.length}`);
    usuarios.forEach(u => console.log(` - ${u.email} (${u.rol ? u.rol.nombre : '—'})`));

    const provincias = await Provincia.findAll();
    console.log(`\nProvincias en la BD: ${provincias.length}`);
    provincias.forEach(p => console.log(` - ${p.nombre}`));

    process.exit(0);
  } catch (err) {
    console.error('Error al consultar la BD:', err.message);
    process.exit(1);
  }
}

check();
