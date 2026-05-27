'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable('delivery_drivers');

    if (!tableInfo.vehicle_type) {
      await queryInterface.addColumn('delivery_drivers', 'vehicle_type', {
        type: Sequelize.STRING(50),
        allowNull: true,
      });
    }

    if (!tableInfo.license_plate) {
      await queryInterface.addColumn('delivery_drivers', 'license_plate', {
        type: Sequelize.STRING(50),
        allowNull: true,
      });
    }

    if (!tableInfo.selfie_verificacion_url) {
      await queryInterface.addColumn('delivery_drivers', 'selfie_verificacion_url', {
        type: Sequelize.STRING(500),
        allowNull: true,
      });
    }

    if (!tableInfo.documentos_rutas) {
      await queryInterface.addColumn('delivery_drivers', 'documentos_rutas', {
        type: Sequelize.JSON,
        allowNull: true,
      });
    }
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('delivery_drivers', 'vehicle_type').catch(() => {});
    await queryInterface.removeColumn('delivery_drivers', 'license_plate').catch(() => {});
    await queryInterface.removeColumn('delivery_drivers', 'selfie_verificacion_url').catch(() => {});
    await queryInterface.removeColumn('delivery_drivers', 'documentos_rutas').catch(() => {});
  },
};
