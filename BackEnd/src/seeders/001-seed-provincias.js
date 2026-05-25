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

    const existing = await queryInterface.sequelize.query(
      "SELECT id FROM provincias",
      { type: Sequelize.QueryTypes.SELECT }
    );
    const existingIds = existing.map(p => p.id);
    const toInsert = provincias.filter(p => !existingIds.includes(p.id));

    if (toInsert.length > 0) {
      await queryInterface.bulkInsert('provincias', toInsert, {});
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('provincias', null, {});
  }
};
