'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('direcciones', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      provincia_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'provincias',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      canton_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'cantones',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      distrito_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'distritos',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      sennas: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      codigo_postal: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      latitud: {
        type: Sequelize.DECIMAL(10, 7),
        allowNull: true,
      },
      longitud: {
        type: Sequelize.DECIMAL(10, 7),
        allowNull: true,
      },
      url_maps: {
        type: Sequelize.STRING,
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
    await queryInterface.dropTable('direcciones');
  },
};
