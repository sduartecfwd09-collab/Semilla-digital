'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('solicitudes_cambio_rol', 'selfie_verificacion_url', {
      type: Sequelize.STRING(500),
      allowNull: true,
    });
    await queryInterface.addColumn('solicitudes_cambio_rol', 'documentos_rutas', {
      type: Sequelize.JSON,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('solicitudes_cambio_rol', 'selfie_verificacion_url');
    await queryInterface.removeColumn('solicitudes_cambio_rol', 'documentos_rutas');
  },
};
