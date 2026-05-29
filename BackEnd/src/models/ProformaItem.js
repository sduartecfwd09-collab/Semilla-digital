const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ProformaItem = sequelize.define('ProformaItem', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    proforma_id: {
      type: DataTypes.STRING,
      allowNull: false,
      references: { model: 'proformas', key: 'id' },
    },
    producto_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'productos', key: 'id' },
    },
    oferta_producto_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'oferta_productos', key: 'id' },
    },
    productor_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'usuarios', key: 'id' },
    },
    nombre_snapshot: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    cantidad: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    precio_unitario: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    unidad: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {
    tableName: 'proforma_items',
    timestamps: true,
  });

  ProformaItem.associate = (models) => {
    ProformaItem.belongsTo(models.Proforma, { foreignKey: 'proforma_id', as: 'proforma' });
    ProformaItem.belongsTo(models.Producto, { foreignKey: 'producto_id', as: 'producto' });
    ProformaItem.belongsTo(models.OfertaProducto, { foreignKey: 'oferta_producto_id', as: 'oferta' });
    ProformaItem.belongsTo(models.Usuario, { foreignKey: 'productor_id', as: 'productor' });
    ProformaItem.hasOne(models.ProducerEarning, { foreignKey: 'proforma_item_id', as: 'earning' });
  };

  return ProformaItem;
};
