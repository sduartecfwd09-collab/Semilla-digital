'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const roles = [
      { id: 1, nombre: 'Administrador', descripcion: 'Control total del sistema', created_at: new Date(), updated_at: new Date() },
      { id: 2, nombre: 'Productor', descripcion: 'Vendedor en ferias', created_at: new Date(), updated_at: new Date() },
      { id: 3, nombre: 'Usuario', descripcion: 'Cliente o usuario general', created_at: new Date(), updated_at: new Date() },
    ];

    // Verificar si ya existen
    const existingRoles = await queryInterface.sequelize.query(
      "SELECT id FROM roles",
      { type: Sequelize.QueryTypes.SELECT }
    );

    const existingIds = existingRoles.map(r => r.id);
    const rolesToInsert = roles.filter(r => !existingIds.includes(r.id));

    if (rolesToInsert.length > 0) {
      return queryInterface.bulkInsert('roles', rolesToInsert, {});
    }
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('roles', null, {});
  }
};
