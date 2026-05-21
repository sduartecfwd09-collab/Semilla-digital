'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const direcciones = [
      {
        id: 1,
        provincia_id: 1, canton_id: 1, distrito_id: 1,
        sennas: 'Costado norte del Parque Central',
        codigo_postal: '10101', latitud: 9.9333, longitud: -84.0833,
        created_at: new Date(), updated_at: new Date()
      },
      {
        id: 2,
        provincia_id: 2, canton_id: 4, distrito_id: 7,
        sennas: 'Frente al Mercado Municipal',
        codigo_postal: '20101', latitud: 10.0167, longitud: -84.2167,
        created_at: new Date(), updated_at: new Date()
      },
      {
        id: 3,
        provincia_id: 3, canton_id: 7, distrito_id: 13,
        sennas: 'Diagonal a la Basílica de los Ángeles',
        codigo_postal: '30101', latitud: 9.8667, longitud: -83.9167,
        created_at: new Date(), updated_at: new Date()
      },
      {
        id: 4,
        provincia_id: 4, canton_id: 10, distrito_id: 19,
        sennas: 'Cerca del Fortín de Heredia',
        codigo_postal: '40101', latitud: 10.0, longitud: -84.1167,
        created_at: new Date(), updated_at: new Date()
      },
      {
        id: 5,
        provincia_id: 5, canton_id: 13, distrito_id: 25,
        sennas: 'Entrada principal a Liberia',
        codigo_postal: '50101', latitud: 10.6333, longitud: -85.4333,
        created_at: new Date(), updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('direcciones', direcciones, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('direcciones', null, {});
  }
};
