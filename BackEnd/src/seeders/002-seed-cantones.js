'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const cantones = [
      // San José (1)
      { id: 1, nombre: 'San José', provincia_id: 1, created_at: new Date(), updated_at: new Date() },
      { id: 2, nombre: 'Escazú', provincia_id: 1, created_at: new Date(), updated_at: new Date() },
      { id: 3, nombre: 'Desamparados', provincia_id: 1, created_at: new Date(), updated_at: new Date() },
      // Alajuela (2)
      { id: 4, nombre: 'Alajuela', provincia_id: 2, created_at: new Date(), updated_at: new Date() },
      { id: 5, nombre: 'San Ramón', provincia_id: 2, created_at: new Date(), updated_at: new Date() },
      { id: 6, nombre: 'Grecia', provincia_id: 2, created_at: new Date(), updated_at: new Date() },
      // Cartago (3)
      { id: 7, nombre: 'Cartago', provincia_id: 3, created_at: new Date(), updated_at: new Date() },
      { id: 8, nombre: 'Paraíso', provincia_id: 3, created_at: new Date(), updated_at: new Date() },
      { id: 9, nombre: 'La Unión', provincia_id: 3, created_at: new Date(), updated_at: new Date() },
      // Heredia (4)
      { id: 10, nombre: 'Heredia', provincia_id: 4, created_at: new Date(), updated_at: new Date() },
      { id: 11, nombre: 'Barva', provincia_id: 4, created_at: new Date(), updated_at: new Date() },
      { id: 12, nombre: 'Santo Domingo', provincia_id: 4, created_at: new Date(), updated_at: new Date() },
      // Guanacaste (5)
      { id: 13, nombre: 'Liberia', provincia_id: 5, created_at: new Date(), updated_at: new Date() },
      { id: 14, nombre: 'Nicoya', provincia_id: 5, created_at: new Date(), updated_at: new Date() },
      { id: 15, nombre: 'Santa Cruz', provincia_id: 5, created_at: new Date(), updated_at: new Date() },
      // Puntarenas (6)
      { id: 16, nombre: 'Puntarenas', provincia_id: 6, created_at: new Date(), updated_at: new Date() },
      { id: 17, nombre: 'Esparza', provincia_id: 6, created_at: new Date(), updated_at: new Date() },
      { id: 18, nombre: 'Quepos', provincia_id: 6, created_at: new Date(), updated_at: new Date() },
      // Limón (7)
      { id: 19, nombre: 'Limón', provincia_id: 7, created_at: new Date(), updated_at: new Date() },
      { id: 20, nombre: 'Pococí', provincia_id: 7, created_at: new Date(), updated_at: new Date() },
      { id: 21, nombre: 'Siquirres', provincia_id: 7, created_at: new Date(), updated_at: new Date() },
    ];

    const existing = await queryInterface.sequelize.query(
      "SELECT id FROM cantones",
      { type: Sequelize.QueryTypes.SELECT }
    );
    const existingIds = existing.map(c => c.id);
    const toInsert = cantones.filter(c => !existingIds.includes(c.id));

    if (toInsert.length > 0) {
      await queryInterface.bulkInsert('cantones', toInsert, {});
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('cantones', null, {});
  }
};
