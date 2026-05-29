// ============================================================
// Modelo: Receta
// Tabla: recetas
// Descripción: Recetas de cocina con ingredientes y pasos
// ============================================================
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Receta = sequelize.define('Receta', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    image_url: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    ingredients: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    steps: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    difficulty: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isIn: [['Fácil', 'Medio', 'Difícil']],
      },
    },
    time: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {
    tableName: 'recetas',
    timestamps: true,
  });

  Receta.associate = (models) => {
    // Una receta puede tener muchos productos como ingredientes (vía tabla intermedia)
    Receta.belongsToMany(models.Producto, {
      through: models.RecetaIngrediente,
      foreignKey: 'receta_id',
      otherKey: 'producto_id',
      as: 'productosIngredientes',
    });
  };

  return Receta;
};
