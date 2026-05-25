'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // We check if the columns exist to avoid duplicate column errors
    // in case the columns were already added manually.
    
    const tableOrdersInfo = await queryInterface.describeTable('delivery_orders');
    
    if (!tableOrdersInfo.cargo_weight) {
      await queryInterface.addColumn('delivery_orders', 'cargo_weight', {
        type: Sequelize.DECIMAL(6, 2),
        allowNull: true,
        defaultValue: 0
      });
    }
    
    if (!tableOrdersInfo.supplements) {
      await queryInterface.addColumn('delivery_orders', 'supplements', {
        type: Sequelize.DECIMAL(8, 2),
        allowNull: true,
        defaultValue: 0
      });
    }
    
    if (!tableOrdersInfo.tips) {
      await queryInterface.addColumn('delivery_orders', 'tips', {
        type: Sequelize.DECIMAL(8, 2),
        allowNull: true,
        defaultValue: 0
      });
    }
    
    if (!tableOrdersInfo.driver_earnings) {
      await queryInterface.addColumn('delivery_orders', 'driver_earnings', {
        type: Sequelize.DECIMAL(8, 2),
        allowNull: true,
        defaultValue: 0
      });
    }
    
    if (!tableOrdersInfo.proof_of_delivery_url) {
      await queryInterface.addColumn('delivery_orders', 'proof_of_delivery_url', {
        type: Sequelize.TEXT,
        allowNull: true
      });
    }

    const tableDriversInfo = await queryInterface.describeTable('delivery_drivers');
    
    if (!tableDriversInfo.accumulated_balance) {
      await queryInterface.addColumn('delivery_drivers', 'accumulated_balance', {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('delivery_orders', 'cargo_weight').catch(() => {});
    await queryInterface.removeColumn('delivery_orders', 'supplements').catch(() => {});
    await queryInterface.removeColumn('delivery_orders', 'tips').catch(() => {});
    await queryInterface.removeColumn('delivery_orders', 'driver_earnings').catch(() => {});
    await queryInterface.removeColumn('delivery_orders', 'proof_of_delivery_url').catch(() => {});
    await queryInterface.removeColumn('delivery_drivers', 'accumulated_balance').catch(() => {});
  }
};
