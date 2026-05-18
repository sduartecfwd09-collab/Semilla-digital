const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const DeliveryOrder = sequelize.define('DeliveryOrder', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    proforma_id: {
      type: DataTypes.STRING,
      allowNull: true,
      references: { model: 'proformas', key: 'id' },
      onDelete: 'SET NULL',
    },
    driver_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'delivery_drivers', key: 'id' },
      onDelete: 'SET NULL',
    },
    pickup_address: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    delivery_address: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'assigned', 'accepted', 'picked_up', 'in_transit', 'delivered', 'cancelled', 'manual_review'),
      allowNull: false,
      defaultValue: 'pending',
    },
    delivery_fee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
  }, {
    tableName: 'delivery_orders',
    timestamps: true,
  });

  DeliveryOrder.associate = (models) => {
    DeliveryOrder.belongsTo(models.Proforma, { foreignKey: 'proforma_id', as: 'proforma' });
    DeliveryOrder.belongsTo(models.DeliveryDriver, { foreignKey: 'driver_id', as: 'driver' });
    DeliveryOrder.hasMany(models.DeliveryRating, { foreignKey: 'order_id', as: 'ratings' });
  };

  return DeliveryOrder;
};
