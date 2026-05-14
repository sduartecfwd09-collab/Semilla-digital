// ============================================================
// Modelo: Canton
// Tabla: cantones
// Descripción: Divisiones administrativas de segundo nivel (cantones)
// ============================================================
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Canton = sequelize.define('Canton', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    provincia_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'provincias',
        key: 'id',
      },
    },
  }, {
    tableName: 'cantones',
    timestamps: true,
  });

  Canton.associate = (models) => {
    // Un cantón pertenece a una provincia
    Canton.belongsTo(models.Provincia, {
      foreignKey: 'provincia_id',
      as: 'provincia',
    });

    // Un cantón tiene muchos distritos
    Canton.hasMany(models.Distrito, {
      foreignKey: 'canton_id',
      as: 'distritos',
    });

    // Un cantón puede estar en muchas direcciones
    Canton.hasMany(models.Direccion, {
      foreignKey: 'canton_id',
      as: 'direcciones',
    });
  };

  return Canton;
};
