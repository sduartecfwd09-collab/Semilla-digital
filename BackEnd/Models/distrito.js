// ============================================================
// Modelo: Distrito
// Tabla: distritos
// Descripción: Divisiones administrativas de tercer nivel (distritos)
// ============================================================
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Distrito = sequelize.define('Distrito', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    canton_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'cantones',
        key: 'id',
      },
    },
  }, {
    tableName: 'distritos',
    timestamps: true,
  });

  Distrito.associate = (models) => {
    // Un distrito pertenece a un cantón
    Distrito.belongsTo(models.Canton, {
      foreignKey: 'canton_id',
      as: 'canton',
    });

    // Un distrito puede estar en muchas direcciones
    Distrito.hasMany(models.Direccion, {
      foreignKey: 'distrito_id',
      as: 'direcciones',
    });
  };

  return Distrito;
};
