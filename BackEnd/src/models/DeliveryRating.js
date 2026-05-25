'use strict';
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const DeliveryRating = sequelize.define('DeliveryRating', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    delivery_order_id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      references: {
        model: 'delivery_orders',
        key: 'id'
      }
    },
    score: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5
      }
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'delivery_ratings',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  DeliveryRating.associate = (models) => {
    DeliveryRating.belongsTo(models.DeliveryOrder, { foreignKey: 'delivery_order_id', as: 'order' });
  };

  return DeliveryRating;
};
