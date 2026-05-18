const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const DeliveryRating = sequelize.define('DeliveryRating', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    driver_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'delivery_drivers', key: 'id' },
      onDelete: 'CASCADE',
    },
    order_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'delivery_orders', key: 'id' },
      onDelete: 'CASCADE',
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
      },
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    tableName: 'delivery_ratings',
    timestamps: true,
  });

  DeliveryRating.associate = (models) => {
    DeliveryRating.belongsTo(models.DeliveryDriver, { foreignKey: 'driver_id', as: 'driver' });
    DeliveryRating.belongsTo(models.DeliveryOrder, { foreignKey: 'order_id', as: 'order' });
  };

  return DeliveryRating;
};
