'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const table = await queryInterface.describeTable('recetas');
    if (!table.image_url) {
      await queryInterface.addColumn('recetas', 'image_url', {
        type: Sequelize.TEXT,
        allowNull: true,
      });
    }
  },

  down: async (queryInterface) => {
    const table = await queryInterface.describeTable('recetas');
    if (table.image_url) {
      await queryInterface.removeColumn('recetas', 'image_url');
    }
  },
};
