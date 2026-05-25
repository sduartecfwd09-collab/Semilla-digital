'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Actualizar rol_solicitado de 'Agricultor' y 'Vendedor' a 'Productor'
    await queryInterface.sequelize.query(
      "UPDATE solicitudes_cambio_rol SET rol_solicitado = 'Productor' WHERE rol_solicitado IN ('Agricultor', 'Vendedor')"
    );
  },

  async down(queryInterface, Sequelize) {
    // No es reversible de forma unívoca, y mantener 'Productor' es el estado deseado permanente.
  }
};
