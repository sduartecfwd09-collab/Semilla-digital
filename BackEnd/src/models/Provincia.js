// ============================================================
// Modelo: Provincia
// Tabla: provincias
// Descripción: Divisiones administrativas de primer nivel (provincias)
// ============================================================
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Provincia = sequelize.define('Provincia', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  }, {
    tableName: 'provincias',
    timestamps: true,
  });

  Provincia.associate = (models) => {
    // Una provincia tiene muchos cantones
    Provincia.hasMany(models.Canton, {
      foreignKey: 'provincia_id',
      as: 'cantones',
    });

    // Una provincia puede estar en muchas direcciones
    Provincia.hasMany(models.Direccion, {
      foreignKey: 'provincia_id',
      as: 'direcciones',
    });
  };

  return Provincia;
};
