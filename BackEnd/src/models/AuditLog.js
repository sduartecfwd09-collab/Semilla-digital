// ============================================================
// Modelo: AuditLog
// Tabla: audit_logs
// Descripción: Registro inmutable de acciones sensibles
// ============================================================
'use strict';
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const AuditLog = sequelize.define('AuditLog', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'usuarios',
        key: 'id',
      },
    },
    accion: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    recurso: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    recurso_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    detalles: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    ip: {
      type: DataTypes.STRING(45),
      allowNull: true,
    },
    user_agent: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  }, {
    tableName: 'audit_logs',
    timestamps: true,
    updatedAt: false, // Los logs de auditoría son inmutables
  });

  AuditLog.associate = (models) => {
    AuditLog.belongsTo(models.Usuario, {
      foreignKey: 'usuario_id',
      as: 'usuario',
    });
  };

  return AuditLog;
};
