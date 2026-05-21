'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('audit_logs', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
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
      accion: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      recurso: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      recurso_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      detalles: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      ip: {
        type: Sequelize.STRING(45),
        allowNull: true,
      },
      user_agent: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Índices para consultas frecuentes
    await queryInterface.addIndex('audit_logs', ['usuario_id'], { name: 'idx_audit_usuario' });
    await queryInterface.addIndex('audit_logs', ['created_at'], { name: 'idx_audit_fecha' });
    await queryInterface.addIndex('audit_logs', ['recurso', 'recurso_id'], { name: 'idx_audit_recurso' });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('audit_logs');
  },
};
