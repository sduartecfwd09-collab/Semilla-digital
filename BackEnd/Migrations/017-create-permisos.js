'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('permisos', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      clave: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
      },
      nombre: {
        type: Sequelize.STRING(150),
        allowNull: false,
      },
      descripcion: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      modulo_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'modulos',
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
  },

  async down(queryInterface) {
    await queryInterface.dropTable('permisos');
  },
};
