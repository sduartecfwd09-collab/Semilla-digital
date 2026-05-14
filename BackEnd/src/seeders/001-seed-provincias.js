'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const provincias = [
      { id: 1, nombre: 'San José', created_at: new Date(), updated_at: new Date() },
      { id: 2, nombre: 'Alajuela', created_at: new Date(), updated_at: new Date() },
      { id: 3, nombre: 'Cartago', created_at: new Date(), updated_at: new Date() },
      { id: 4, nombre: 'Heredia', created_at: new Date(), updated_at: new Date() },
      { id: 5, nombre: 'Guanacaste', created_at: new Date(), updated_at: new Date() },
      { id: 6, nombre: 'Puntarenas', created_at: new Date(), updated_at: new Date() },
      { id: 7, nombre: 'Limón', created_at: new Date(), updated_at: new Date() },
    ];

    await queryInterface.bulkInsert('provincias', provincias, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('provincias', null, {});
  }
};
