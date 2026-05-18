const { Producto } = require('./src/models');
const { sequelize } = require('./src/models');

async function test() {
  try {
    const data = await Producto.findAll();
    console.log(JSON.stringify(data, null, 2));
    process.exit(0);
  } catch(err) {
    console.error(err);
    process.exit(1);
  }
}

test();
