'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('producer_earnings', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('(UUID())'),
        primaryKey: true,
        allowNull: false,
      },
      productor_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'usuarios', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      proforma_id: {
        type: Sequelize.STRING,
        allowNull: false,
        references: { model: 'proformas', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      proforma_item_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'proforma_items', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      monto_bruto: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      comision_plataforma: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      porcentaje_comision: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0,
      },
      monto_neto: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      estado: {
        type: Sequelize.ENUM('Pendiente', 'Liquidado', 'Cancelado'),
        allowNull: false,
        defaultValue: 'Pendiente',
      },
      fecha_liquidacion: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      notas: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('producer_earnings');
  },
};
