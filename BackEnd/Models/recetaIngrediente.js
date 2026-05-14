const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const RecetaIngrediente = sequelize.define('RecetaIngrediente', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    receta_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'recetas', key: 'id' },
    },
    producto_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'productos', key: 'id' },
    },
    cantidad: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    unidad: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {
    tableName: 'receta_ingredientes',
    timestamps: true,
  });

  return RecetaIngrediente;
};
