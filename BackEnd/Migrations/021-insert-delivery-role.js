'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if role already exists
    const roles = await queryInterface.sequelize.query(
      "SELECT id FROM roles WHERE nombre = 'Repartidor' OR nombre = 'DRIVER'",
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (roles.length === 0) {
      await queryInterface.bulkInsert('roles', [{
        id: 4, // or rely on auto-increment if possible, but the seeder uses 4
        nombre: 'Repartidor',
        descripcion: 'Repartidor de pedidos (Delivery)',
        created_at: new Date(),
        updated_at: new Date()
      }]);
    } else {
      // If it exists but is named DRIVER, we might want to rename it to Repartidor for consistency with Spanish roles
      await queryInterface.bulkUpdate('roles', 
        { nombre: 'Repartidor', descripcion: 'Repartidor de pedidos (Delivery)' },
        { id: 4 }
      );
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('roles', { nombre: 'Repartidor' }, {});
  }
};
