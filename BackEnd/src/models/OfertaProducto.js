const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const OfertaProducto = sequelize.define('OfertaProducto', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    producto_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'productos', key: 'id' },
    },
    feria_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'ferias', key: 'id' },
    },
    precio: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    unidad: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {
    tableName: 'oferta_productos',
    timestamps: true,
  });

  OfertaProducto.associate = (models) => {
    OfertaProducto.belongsTo(models.Producto, { foreignKey: 'producto_id', as: 'producto' });
    OfertaProducto.belongsTo(models.Feria, { foreignKey: 'feria_id', as: 'feria' });
  };

  return OfertaProducto;
};
