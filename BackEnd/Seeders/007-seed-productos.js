'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const productos = [
      {
        id: 'p1111111-1111-1111-1111-111111111111',
        nombre: 'Tomate', categoria: 'Verduras', emoji: '🍅',
        descripcion: 'Tomate fresco de la zona de Cartago',
        unidad: 'Kg', disponible: true,
        user_id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        created_at: new Date(), updated_at: new Date()
      },
      {
        id: 'p2222222-2222-2222-2222-222222222222',
        nombre: 'Cebolla', categoria: 'Verduras', emoji: '🧅',
        descripcion: 'Cebolla blanca de calidad premium',
        unidad: 'Kg', disponible: true,
        user_id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        created_at: new Date(), updated_at: new Date()
      },
      {
        id: 'p3333333-3333-3333-3333-333333333333',
        nombre: 'Banano', categoria: 'Frutas', emoji: '🍌',
        descripcion: 'Banano maduro de la zona de Limón',
        unidad: 'Mano', disponible: true,
        user_id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        created_at: new Date(), updated_at: new Date()
      },
      {
        id: 'p4444444-4444-4444-4444-444444444444',
        nombre: 'Papa', categoria: 'Tubérculos', emoji: '🥔',
        descripcion: 'Papa blanca para freír o puré',
        unidad: 'Kg', disponible: true,
        user_id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        created_at: new Date(), updated_at: new Date()
      },
      {
        id: 'p5555555-5555-5555-5555-555555555555',
        nombre: 'Zanahoria', categoria: 'Verduras', emoji: '🥕',
        descripcion: 'Zanahoria fresca y crujiente',
        unidad: 'Kg', disponible: true,
        user_id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        created_at: new Date(), updated_at: new Date()
      },
      {
        id: 'p6666666-6666-6666-6666-666666666666',
        nombre: 'Fresa', categoria: 'Frutas', emoji: '🍓',
        descripcion: 'Fresa dulce de las faldas del Volcán Poás',
        unidad: 'Caja', disponible: true,
        user_id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        created_at: new Date(), updated_at: new Date()
      },
      {
        id: 'p7777777-7777-7777-7777-777777777777',
        nombre: 'Lechuga', categoria: 'Verduras', emoji: '🥬',
        descripcion: 'Lechuga americana hidropónica',
        unidad: 'Unidad', disponible: true,
        user_id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        created_at: new Date(), updated_at: new Date()
      },
      {
        id: 'p8888888-8888-8888-8888-888811111111',
        nombre: 'Sandía', categoria: 'Frutas', emoji: '🍉',
        descripcion: 'Sandía roja y jugosa de Guanacaste',
        unidad: 'Unidad', disponible: true,
        user_id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        created_at: new Date(), updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('productos', productos, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('productos', null, {});
  }
};
