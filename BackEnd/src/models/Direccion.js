// ============================================================
// Modelo: Direccion
// Tabla: direcciones
// Descripción: Direcciones físicas con geolocalización
// ============================================================
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Direccion = sequelize.define('Direccion', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    provincia_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'provincias',
        key: 'id',
      },
    },
    canton_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'cantones',
        key: 'id',
      },
    },
    distrito_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'distritos',
        key: 'id',
      },
    },
    sennas: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    codigo_postal: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    latitud: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: true,
    },
    longitud: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: true,
    },
    url_maps: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {
    tableName: 'direcciones',
    timestamps: true,
  });

  Direccion.associate = (models) => {
    // Una dirección pertenece a una provincia
    Direccion.belongsTo(models.Provincia, {
      foreignKey: 'provincia_id',
      as: 'provincia',
    });

    // Una dirección pertenece a un cantón
    Direccion.belongsTo(models.Canton, {
      foreignKey: 'canton_id',
      as: 'canton',
    });

    // Una dirección pertenece a un distrito
    Direccion.belongsTo(models.Distrito, {
      foreignKey: 'distrito_id',
      as: 'distrito',
    });

    // Relaciones inversas 1:1
    Direccion.hasOne(models.Usuario, {
      foreignKey: 'direccion_id',
      as: 'usuario',
    });

    Direccion.hasOne(models.Feria, {
      foreignKey: 'direccion_id',
      as: 'feria',
    });

    Direccion.hasOne(models.PuestoProductor, {
      foreignKey: 'direccion_id',
      as: 'puestoProductor',
    });

    Direccion.hasMany(models.Proforma, {
      foreignKey: 'direccion_id',
      as: 'proformas',
    });
  };

  return Direccion;
};
