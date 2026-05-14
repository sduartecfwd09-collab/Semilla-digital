'use strict';
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { sequelize, Usuario, Feria, PuestoAgricultor, Producto, Precio, Receta, SolicitudCambioRol, ContactMessage } = require('../models');

async function seed() {
  try {
    console.log('🌱 Iniciando seeder de AgroMap...\n');

    // Sincronizar tablas (force: true recrea las tablas)
    await sequelize.sync({ force: true });
    console.log('✅ Tablas sincronizadas\n');

    // ── Usuarios ──────────────────────────────────────────────────────────────
    const [admin, agricultor1, agricultor2, usuario1] = await Usuario.bulkCreate([
      {
        name: 'Admin Principal',
        email: 'admin@agromap.cr',
        password: 'admin123',
        role: 'Administrador',
        status: 'Activo',
        avatar: null,
      },
      {
        name: 'Carlos Rodríguez',
        email: 'carlos@feria.cr',
        password: 'carlos123',
        role: 'Agricultor',
        status: 'Activo',
        avatar: null,
      },
      {
        name: 'María Víquez',
        email: 'maria@feria.cr',
        password: 'maria123',
        role: 'Agricultor',
        status: 'Activo',
        avatar: null,
      },
      {
        name: 'Luis Mora',
        email: 'luis@usuario.cr',
        password: 'luis123',
        role: 'Usuario',
        status: 'Activo',
        avatar: null,
      },
    ]);
    console.log('✅ Usuarios creados:', [admin, agricultor1, agricultor2, usuario1].map(u => u.name).join(', '));

    // ── Ferias ────────────────────────────────────────────────────────────────
    const [feriaCartago, feriaSanJose, feriaAlajuela, feriaHeredia] = await Feria.bulkCreate([
      {
        nombre: 'Feria del Agricultor de Cartago',
        provincia: 'Cartago',
        direccion: 'Frente al Estadio Fello Meza, Cartago Centro',
        dias: 'Sábados',
        horario: '05:00 - 12:00',
      },
      {
        nombre: 'Feria del Agricultor Zapote',
        provincia: 'San José',
        direccion: 'Parque de Zapote, San José',
        dias: 'Sábados y Domingos',
        horario: '05:00 - 13:00',
      },
      {
        nombre: 'Feria del Agricultor Alajuela Centro',
        provincia: 'Alajuela',
        direccion: 'Mercado Central de Alajuela',
        dias: 'Viernes y Sábados',
        horario: '04:30 - 12:00',
      },
      {
        nombre: 'Feria del Agricultor Heredia',
        provincia: 'Heredia',
        direccion: 'Avenida Central, Heredia',
        dias: 'Sábados',
        horario: '05:00 - 12:30',
      },
    ]);
    console.log('✅ Ferias creadas:', [feriaCartago, feriaSanJose, feriaAlajuela, feriaHeredia].map(f => f.nombre).join(', '));

    // Asignar feriaId a los agricultores
    await agricultor1.update({ feriaId: feriaCartago.id });
    await agricultor2.update({ feriaId: feriaSanJose.id });

    // ── Puestos de Agricultor ─────────────────────────────────────────────────
    const [puesto1, puesto2] = await PuestoAgricultor.bulkCreate([
      {
        usuarioId: agricultor1.id,
        nombrePuesto: 'Verduras del Campo de Carlos',
        descripcion: 'Cultivos orgánicos de la zona de Tierra Blanca, Cartago. Frescos y sin pesticidas.',
        ubicacion: ['Feria del Agricultor de Cartago'],
        telefono: '8888-1111',
        email: 'carlos@feria.cr',
        horarios: 'Sábados de 05:00 a 12:00',
        horariosList: [{ dia: 'Sábados', inicio: '05:00', fin: '12:00' }],
        feriaId: feriaCartago.id,
        tiposProducto: ['Verduras', 'Tubérculos'],
        fotosNombres: [],
        fotosBase64: [],
        metodosCultivo: 'Cultivo orgánico sin pesticidas químicos',
        redesSociales: '@verduras_carlos',
        fechaRegistro: new Date(),
      },
      {
        usuarioId: agricultor2.id,
        nombrePuesto: 'Frutas Frescas de María',
        descripcion: 'Frutas tropicales y de temporada cultivadas en Los Santos, San José.',
        ubicacion: ['Feria del Agricultor Zapote'],
        telefono: '7777-2222',
        email: 'maria@feria.cr',
        horarios: 'Sábados y Domingos de 05:00 a 13:00',
        horariosList: [
          { dia: 'Sábados', inicio: '05:00', fin: '13:00' },
          { dia: 'Domingos', inicio: '06:00', fin: '12:00' },
        ],
        feriaId: feriaSanJose.id,
        tiposProducto: ['Frutas', 'Cítricos'],
        fotosNombres: [],
        fotosBase64: [],
        metodosCultivo: 'Agricultura familiar tradicional',
        redesSociales: '',
        fechaRegistro: new Date(),
      },
    ]);
    console.log('✅ Puestos creados:', [puesto1, puesto2].map(p => p.nombrePuesto).join(', '));

    // ── Productos + Precios ───────────────────────────────────────────────────
    const productosData = [
      {
        producto: {
          userId: agricultor1.id,
          nombre: 'Zanahoria',
          emoji: '🥕',
          descripcion: 'Zanahoria fresca de Tierra Blanca, ideal para jugos y ensaladas.',
          categoria: 'Verduras',
          disponible: true,
          unidad: 'Kilogramo',
          provincia: 'Cartago',
        },
        precios: [
          { feriaId: feriaCartago.id, feriaNombre: feriaCartago.nombre, provincia: 'Cartago', precio: 800 },
          { feriaId: feriaAlajuela.id, feriaNombre: feriaAlajuela.nombre, provincia: 'Alajuela', precio: 900 },
        ],
      },
      {
        producto: {
          userId: agricultor1.id,
          nombre: 'Papa Blanca',
          emoji: '🥔',
          descripcion: 'Papa blanca cultivada en las alturas de Cartago.',
          categoria: 'Tubérculos',
          disponible: true,
          unidad: 'Kilogramo',
          provincia: 'Cartago',
        },
        precios: [
          { feriaId: feriaCartago.id, feriaNombre: feriaCartago.nombre, provincia: 'Cartago', precio: 600 },
          { feriaId: feriaSanJose.id, feriaNombre: feriaSanJose.nombre, provincia: 'San José', precio: 700 },
        ],
      },
      {
        producto: {
          userId: agricultor1.id,
          nombre: 'Repollo',
          emoji: '🥬',
          descripcion: 'Repollo fresco y tierno.',
          categoria: 'Verduras',
          disponible: true,
          unidad: 'Unidad',
          provincia: 'Cartago',
        },
        precios: [
          { feriaId: feriaCartago.id, feriaNombre: feriaCartago.nombre, provincia: 'Cartago', precio: 500 },
        ],
      },
      {
        producto: {
          userId: agricultor2.id,
          nombre: 'Banano',
          emoji: '🍌',
          descripcion: 'Banano maduro de Los Santos.',
          categoria: 'Frutas',
          disponible: true,
          unidad: 'Racimo',
          provincia: 'San José',
        },
        precios: [
          { feriaId: feriaSanJose.id, feriaNombre: feriaSanJose.nombre, provincia: 'San José', precio: 1200 },
          { feriaId: feriaHeredia.id, feriaNombre: feriaHeredia.nombre, provincia: 'Heredia', precio: 1300 },
        ],
      },
      {
        producto: {
          userId: agricultor2.id,
          nombre: 'Naranja Valencia',
          emoji: '🍊',
          descripcion: 'Naranja jugosa perfecta para jugo natural.',
          categoria: 'Cítricos',
          disponible: true,
          unidad: 'Kilogramo',
          provincia: 'San José',
        },
        precios: [
          { feriaId: feriaSanJose.id, feriaNombre: feriaSanJose.nombre, provincia: 'San José', precio: 700 },
          { feriaId: feriaAlajuela.id, feriaNombre: feriaAlajuela.nombre, provincia: 'Alajuela', precio: 750 },
          { feriaId: feriaCartago.id, feriaNombre: feriaCartago.nombre, provincia: 'Cartago', precio: 800 },
        ],
      },
    ];

    for (const { producto, precios } of productosData) {
      const prod = await Producto.create(producto);
      for (const p of precios) {
        await Precio.create({ productoId: prod.id, ...p });
      }
    }
    console.log('✅ Productos y precios creados');

    // ── Recetas ───────────────────────────────────────────────────────────────
    await Receta.bulkCreate([
      {
        title: 'Sopa de Zanahoria y Papa',
        description: 'Una sopa reconfortante con las mejores verduras de la feria del agricultor.',
        ingredients: ['3 zanahorias medianas', '2 papas grandes', '1 cebolla', '2 dientes de ajo', 'sal y pimienta al gusto', 'apio'],
        steps: [
          'Pelar y cortar las zanahorias y papas en cubos.',
          'Sofreír la cebolla y el ajo en aceite hasta dorar.',
          'Agregar las verduras y cubrir con agua.',
          'Cocinar a fuego medio por 25 minutos.',
          'Licuar la mitad para obtener una textura cremosa.',
          'Sazonar con sal y pimienta. Servir caliente.',
        ],
        difficulty: 'Fácil',
        time: '35 min',
      },
      {
        title: 'Ensalada Fresca de Repollo',
        description: 'Ensalada crujiente y refrescante, ideal como acompañamiento.',
        ingredients: ['1/2 repollo finamente picado', '2 zanahorias ralladas', 'jugo de 2 limones', '2 cucharadas de aceite de oliva', 'sal, pimienta y culantro'],
        steps: [
          'Picar el repollo muy finamente.',
          'Rallar las zanahorias.',
          'Mezclar repollo y zanahoria en un tazón.',
          'Preparar aderezo con limón, aceite, sal y pimienta.',
          'Mezclar todo y refrigerar 15 minutos antes de servir.',
        ],
        difficulty: 'Fácil',
        time: '15 min',
      },
      {
        title: 'Batido de Banano y Naranja',
        description: 'Batido tropical energizante con frutas frescas de la feria.',
        ingredients: ['2 bananos maduros', '3 naranjas (jugo)', '1 taza de leche', '1 cucharada de miel', 'hielo al gusto'],
        steps: [
          'Exprimir el jugo de las naranjas.',
          'Pelar y trocear los bananos.',
          'Colocar todos los ingredientes en la licuadora.',
          'Licuar hasta obtener consistencia suave.',
          'Servir inmediatamente con hielo.',
        ],
        difficulty: 'Fácil',
        time: '10 min',
      },
      {
        title: 'Papas al Horno con Hierbas',
        description: 'Papas crujientes por fuera y suaves por dentro con hierbas aromáticas.',
        ingredients: ['4 papas medianas', '3 cucharadas de aceite de oliva', '1 cucharadita de romero', '1 cucharadita de tomillo', '2 dientes de ajo', 'sal y pimienta'],
        steps: [
          'Precalentar el horno a 200°C.',
          'Lavar y cortar las papas en gajos.',
          'Mezclar con aceite, hierbas y ajo.',
          'Disponer en bandeja y hornear 35-40 minutos.',
          'Voltear a la mitad del tiempo para dorar parejo.',
        ],
        difficulty: 'Media',
        time: '50 min',
      },
    ]);
    console.log('✅ Recetas creadas');

    // ── Solicitudes de Cambio de Rol ──────────────────────────────────────────
    await SolicitudCambioRol.bulkCreate([
      {
        usuarioId: usuario1.id,
        nombreDelPuesto: 'Productos Orgánicos de Luis',
        correoUsuario: 'luis@usuario.cr',
        rolSolicitado: 'Agricultor',
        estado: 'Pendiente',
        motivoRespuesta: '',
        fechaSolicitud: new Date(),
      },
    ]);
    console.log('✅ Solicitudes de cambio de rol creadas');

    // ── Mensajes de Contacto ──────────────────────────────────────────────────
    await ContactMessage.bulkCreate([
      {
        nombre: 'Ana Jiménez',
        correo: 'ana@email.com',
        telefono: '6666-3333',
        mensaje: '¿Dónde puedo encontrar la feria del agricultor más cercana a Alajuela?',
        respuesta: '',
        fechaEnvio: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        estado: 'Pendiente',
      },
      {
        nombre: 'Pedro Salas',
        correo: 'pedro@email.com',
        telefono: '',
        mensaje: 'Me gustaría registrarme como agricultor y saber cuáles son los requisitos.',
        respuesta: 'Hola Pedro, para registrarte como agricultor debes hacer una solicitud en tu perfil de usuario.',
        fechaEnvio: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        fechaRespuesta: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        estado: 'Respondido',
      },
    ]);
    console.log('✅ Mensajes de contacto creados');

    console.log('\n🎉 Seeder completado exitosamente!');
    console.log('──────────────────────────────────────');
    console.log('Credenciales de prueba:');
    console.log('  Admin:      admin@agromap.cr     / admin123');
    console.log('  Agricultor: carlos@feria.cr      / carlos123');
    console.log('  Agricultor: maria@feria.cr       / maria123');
    console.log('  Usuario:    luis@usuario.cr      / luis123');
    console.log('──────────────────────────────────────');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error en seeder:', error);
    process.exit(1);
  }
}

seed();
