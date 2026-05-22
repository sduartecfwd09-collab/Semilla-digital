const { PuestoProductor, Feria } = require('../src/models');
const puestoService = require('../src/services/puestoProductorService');

const testData = {
  usuarioId: 1,
  nombrePuesto: 'Puesto Modificado',
  descripcion: 'Descripcion de prueba',
  ubicacion: ['Feria del Productor Zapote'],
  feriaId: 'google-San José-1',
  tiposProducto: ['Verduras'],
  fotosNombres: [],
  fotosBase64: [],
  telefono: '88888888',
  email: 'test@gmail.com',
  horarios: 'Lunes 8am a 5pm',
  horariosList: [],
  metodosCultivo: 'Cultivo organico',
  redesSociales: '@test',
  fechaRegistro: new Date().toISOString()
};

async function test() {
  try {
    // Buscar un puesto
    let p = await PuestoProductor.findOne({ where: { usuario_id: 1 } });
    if (!p) {
        p = await puestoService.create(testData);
        console.log('Creado nuevo puesto id:', p.id);
    }
    
    console.log('Probando PuestoProductor.update...');
    const result = await puestoService.update(p.id, testData);
    console.log('¡Éxito!', result.id);
  } catch (err) {
    console.error('Error detallado:', err);
  }
}

test();
