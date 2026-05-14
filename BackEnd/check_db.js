const { Usuario, Provincia } = require('./Models');

async function check() {
  try {
    const usuarios = await Usuario.findAll();
    console.log(`Usuarios en la BD: ${usuarios.length}`);
    usuarios.forEach(u => console.log(` - ${u.email} (${u.role})`));

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
