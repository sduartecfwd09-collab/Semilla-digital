'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('proformas', {
      id: {
        type: Sequelize.STRING,
        primaryKey: true,
        allowNull: false,
        // Formato: PRO-<timestamp> — se genera en el controller/service
      },
      usuario_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'usuarios',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      fecha: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      items: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      subtotal: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      total: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      direccion_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'direcciones',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      costo_envio: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0,
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
    await queryInterface.dropTable('proformas');
  },
};
