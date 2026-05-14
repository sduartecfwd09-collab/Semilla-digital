'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('puesto_ferias', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      puesto_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'puestos_agricultor',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      feria_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'ferias',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
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

    // Índice único compuesto para evitar duplicados en la relación N:M
    await queryInterface.addIndex('puesto_ferias', ['puesto_id', 'feria_id'], {
      unique: true,
      name: 'puesto_ferias_unique',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('puesto_ferias');
  },
};
