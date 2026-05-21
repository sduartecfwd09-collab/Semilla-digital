'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const productos = [
      {
        id: 1,
        nombre: 'Tomate', categoria: 'Verduras', emoji: '🍅',
        descripcion: 'Tomate fresco de la zona de Cartago',
        unidad: 'Kg', disponible: true,
        user_id: 2,
        created_at: new Date(), updated_at: new Date()
      },
      {
        id: 2,
        nombre: 'Cebolla', categoria: 'Verduras', emoji: '🧅',
        descripcion: 'Cebolla blanca de calidad premium',
        unidad: 'Kg', disponible: true,
        user_id: 2,
        created_at: new Date(), updated_at: new Date()
      },
      {
        id: 3,
        nombre: 'Banano', categoria: 'Frutas', emoji: '🍌',
        descripcion: 'Banano maduro de la zona de Limón',
        unidad: 'Mano', disponible: true,
        user_id: 2,
        created_at: new Date(), updated_at: new Date()
      },
      {
        id: 4,
        nombre: 'Papa', categoria: 'Tubérculos', emoji: '🥔',
        descripcion: 'Papa blanca para freír o puré',
        unidad: 'Kg', disponible: true,
        user_id: 2,
        created_at: new Date(), updated_at: new Date()
      },
      {
        id: 5,
        nombre: 'Zanahoria', categoria: 'Verduras', emoji: '🥕',
        descripcion: 'Zanahoria fresca y crujiente',
        unidad: 'Kg', disponible: true,
        user_id: 2,
        created_at: new Date(), updated_at: new Date()
      },
      {
        id: 6,
        nombre: 'Fresa', categoria: 'Frutas', emoji: '🍓',
        descripcion: 'Fresa dulce de las faldas del Volcán Poás',
        unidad: 'Caja', disponible: true,
        user_id: 2,
        created_at: new Date(), updated_at: new Date()
      },
      {
        id: 7,
        nombre: 'Lechuga', categoria: 'Verduras', emoji: '🥬',
        descripcion: 'Lechuga americana hidropónica',
        unidad: 'Unidad', disponible: true,
        user_id: 2,
        created_at: new Date(), updated_at: new Date()
      },
      {
        id: 8,
        nombre: 'Sandía', categoria: 'Frutas', emoji: '🍉',
        descripcion: 'Sandía roja y jugosa de Guanacaste',
        unidad: 'Unidad', disponible: true,
        user_id: 2,
        created_at: new Date(), updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('productos', productos, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('productos', null, {});
  }
};
