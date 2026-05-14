"use strict";
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Role = sequelize.define(
    "Role",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      nombre: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
      },
      descripcion: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
    },
    {
      tableName: "roles",
      timestamps: true,
    },
  );

  Role.associate = (models) => {
    Role.hasMany(models.Usuario, {
      foreignKey: "roleId",
      as: "usuarios",
    });

    // RBAC: Un rol tiene muchos permisos (N:M)
    Role.belongsToMany(models.Permiso, {
      through: models.RolePermiso,
      foreignKey: 'role_id',
      otherKey: 'permiso_id',
      as: 'permisos',
    });
  };

  return Role;
};
