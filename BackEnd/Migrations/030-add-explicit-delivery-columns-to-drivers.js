'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable('delivery_drivers');

    const columnsToAdd = {
      full_name: { type: Sequelize.STRING(150), allowNull: true },
      email: { type: Sequelize.STRING(200), allowNull: true },
      phone: { type: Sequelize.STRING(50), allowNull: true },
      plate_number: { type: Sequelize.STRING(50), allowNull: true },
      brand: { type: Sequelize.STRING(100), allowNull: true },
      model: { type: Sequelize.STRING(100), allowNull: true },
      identity_document_url: { type: Sequelize.STRING(500), allowNull: true },
      criminal_record_url: { type: Sequelize.STRING(500), allowNull: true },
      license_url: { type: Sequelize.STRING(500), allowNull: true },
      property_card_url: { type: Sequelize.STRING(500), allowNull: true },
      riteve_url: { type: Sequelize.STRING(500), allowNull: true },
      marchamo_url: { type: Sequelize.STRING(500), allowNull: true },
      selfie_verification_url: { type: Sequelize.STRING(500), allowNull: true },
    };

    for (const [colName, colSpec] of Object.entries(columnsToAdd)) {
      if (!tableInfo[colName]) {
        await queryInterface.addColumn('delivery_drivers', colName, colSpec);
      }
    }
  },

  async down(queryInterface) {
    const columnsToRemove = [
      'full_name',
      'email',
      'phone',
      'plate_number',
      'brand',
      'model',
      'identity_document_url',
      'criminal_record_url',
      'license_url',
      'property_card_url',
      'riteve_url',
      'marchamo_url',
      'selfie_verification_url',
    ];

    for (const colName of columnsToRemove) {
      await queryInterface.removeColumn('delivery_drivers', colName).catch(() => {});
    }
  },
};
