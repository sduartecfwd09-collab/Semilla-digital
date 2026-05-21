// ============================================================
// Modelo: RolePermiso
// Tabla: role_permiso
// Descripción: Tabla pivote — conecta roles con permisos (N:M)
//              Corazón del sistema RBAC
// ============================================================
'use strict';
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const RolePermiso = sequelize.define('RolePermiso', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    role_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'roles',
        key: 'id',
      },
    },
    permiso_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'permisos',
        key: 'id',
      },
    },
    otorgado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  }, {
    tableName: 'role_permiso',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['role_id', 'permiso_id'],
        name: 'idx_role_permiso_unique',
      },
    ],
  });

  RolePermiso.associate = (models) => {
    RolePermiso.belongsTo(models.Role, {
      foreignKey: 'role_id',
      as: 'role',
    });
    RolePermiso.belongsTo(models.Permiso, {
      foreignKey: 'permiso_id',
      as: 'permiso',
    });
  };

  return RolePermiso;
};
