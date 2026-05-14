'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('modulos', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      clave: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
      },
      nombre: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      descripcion: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      icono: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      orden: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
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
    await queryInterface.dropTable('modulos');
  },
};
