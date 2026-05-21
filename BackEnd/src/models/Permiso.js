// ============================================================
// Modelo: Permiso
// Tabla: permisos
// Descripción: Catálogo maestro de acciones del sistema
// ============================================================
'use strict';
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Permiso = sequelize.define('Permiso', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    clave: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    nombre: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    modulo_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'modulos',
        key: 'id',
      },
    },
  }, {
    tableName: 'permisos',
    timestamps: true,
  });

  Permiso.associate = (models) => {
    Permiso.belongsTo(models.Modulo, {
      foreignKey: 'modulo_id',
      as: 'modulo',
    });

    // Relación N:M con Role a través de RolePermiso
    Permiso.belongsToMany(models.Role, {
      through: models.RolePermiso,
      foreignKey: 'permiso_id',
      otherKey: 'role_id',
      as: 'roles',
    });
  };

  return Permiso;
};
