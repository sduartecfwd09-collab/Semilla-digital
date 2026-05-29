const { Producto, OfertaProducto } = require('./src/models');
const sequelize = require('./src/config/database');

async function check() {
  try {
    await sequelize.authenticate();
    console.log('Conexión establecida.');

    const productos = await Producto.findAll({
      include: ['usuario', 'ofertas']
    });
    console.log(`Productos en la BD: ${productos.length}`);
    productos.forEach(p => {
      console.log(` - ID: ${p.id}, Nombre: ${p.nombre}, Categoría: ${p.categoria}, Disponible: ${p.disponible}, User ID: ${p.user_id}`);
      console.log(`   Ofertas: ${p.ofertas ? p.ofertas.length : 0}`);
    });

    process.exit(0);
  } catch (err) {
    console.error('Error al consultar la BD:', err);
    process.exit(1);
  }
}

check();
