'use strict';
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Usuario = sequelize.define('Usuario', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(200),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'roles',
        key: 'id',
      },
    },
    status: {
      type: DataTypes.ENUM('Activo', 'Inactivo'),
      allowNull: false,
      defaultValue: 'Activo',
    },
    avatar: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    feriaId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    puesto_info: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    direccionId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    role: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.rol ? this.rol.nombre : null;
      }
    }
  }, {
    tableName: 'usuarios',
    timestamps: true,
  });

  Usuario.associate = (models) => {
    // Un usuario tiene un rol (RBAC)
    Usuario.belongsTo(models.Role, {
      foreignKey: 'roleId',
      as: 'rol',
    });

    Usuario.belongsTo(models.Feria, {
      foreignKey: 'feriaId',
      as: 'feria',
    });

    Usuario.belongsTo(models.Direccion, {
      foreignKey: 'direccionId',
      as: 'direccion',
    });

    Usuario.hasMany(models.Producto, {
      foreignKey: 'user_id',
      as: 'productos',
      onDelete: 'CASCADE',
    });

    Usuario.hasMany(models.SolicitudCambioRol, {
      foreignKey: 'usuario_id',
      as: 'solicitudesCambioRol',
      onDelete: 'CASCADE',
    });

    Usuario.hasOne(models.PuestoAgricultor, {
      foreignKey: 'usuario_id',
      as: 'puestoAgricultor',
      onDelete: 'CASCADE',
    });

    Usuario.hasMany(models.Proforma, {
      foreignKey: 'usuario_id',
      as: 'proformas',
      onDelete: 'SET NULL',
    });
  };

  return Usuario;
};
