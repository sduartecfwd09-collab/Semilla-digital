const { Usuario, Provincia } = require('./src/models');
const sequelize = require('./src/config/database');

async function check() {
  try {
    await sequelize.authenticate();
    console.log('Conexión a la base de datos establecida correctamente.');

    const usuarios = await Usuario.findAll();
    console.log(`Usuarios en la BD: ${usuarios.length}`);
    usuarios.forEach(u => console.log(` - ${u.email || u.nombre} (${u.role || 'N/A'})`));

    const provincias = await Provincia.findAll();
    console.log(`Provincias en la BD: ${provincias.length}`);
    provincias.forEach(p => console.log(` - ${p.nombre}`));

    process.exit(0);
  } catch (err) {
    console.error('Error al consultar la BD:', err);
    process.exit(1);
  }
}

check();
