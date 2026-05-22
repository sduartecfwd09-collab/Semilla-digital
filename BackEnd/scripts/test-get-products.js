const productoService = require('../src/services/productoService');

async function test() {
  try {
    const data = await productoService.findAll({});
    console.log('Total productos:', data.length);
    const nullCats = data.filter(p => !p.categoria);
    console.log('Productos con categoria null:', nullCats.length);
    if(nullCats.length > 0) {
      console.log('Ejemplo:', nullCats[0].nombre);
    }
  } catch (err) {
    console.error('Error detallado:', err);
  }
}

test();
