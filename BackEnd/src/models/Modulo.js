// ============================================================
// Modelo: Modulo
// Tabla: modulos
// Descripción: Agrupa permisos por área funcional del sistema
// ============================================================
'use strict';
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Modulo = sequelize.define('Modulo', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    clave: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    icono: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    orden: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  }, {
    tableName: 'modulos',
    timestamps: true,
  });

  Modulo.associate = (models) => {
    Modulo.hasMany(models.Permiso, {
      foreignKey: 'modulo_id',
      as: 'permisos',
    });
  };

  return Modulo;
};
