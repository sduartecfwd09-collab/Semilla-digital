'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('puestos_agricultor', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      usuario_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: 'usuarios',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      feria_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'ferias',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
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
      nombre_puesto: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      descripcion: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      telefono: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      horarios: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      horarios_list: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      tipos_producto: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      metodos_cultivo: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      redes_sociales: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      fotos_base64: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      fotos_nombres: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      fecha_registro: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
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
    await queryInterface.dropTable('puestos_agricultor');
  },
};
