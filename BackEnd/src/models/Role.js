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
  };

  return Role;
};
