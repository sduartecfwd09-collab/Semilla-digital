'use strict';
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const DeliveryOrder = sequelize.define('DeliveryOrder', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    order_id: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'proformas',
        key: 'id'
      }
    },
    driver_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'delivery_drivers',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.ENUM('CREATED', 'PENDING', 'QUEUED', 'ASSIGNED', 'ACCEPTED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'MANUAL_REVIEW', 'CANCELLED'),
      allowNull: false,
      defaultValue: 'CREATED'
    },
    pickup_address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    pickup_lat: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: true
    },
    pickup_lng: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: true
    },
    dropoff_address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    dropoff_lat: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: true
    },
    dropoff_lng: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: true
    },
    distance_km: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: true
    },
    eta_minutes: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    base_cost: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: true
    },
    km_rate: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: true
    },
    total_cost: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: true
    },
    assignment_attempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false
    },
    assigned_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    accepted_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    picked_up_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    delivered_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'delivery_orders',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  DeliveryOrder.associate = (models) => {
    DeliveryOrder.belongsTo(models.Proforma, { foreignKey: 'order_id', as: 'proforma' });
    DeliveryOrder.belongsTo(models.DeliveryDriver, { foreignKey: 'driver_id', as: 'driver' });
    DeliveryOrder.hasOne(models.DeliveryRating, { foreignKey: 'delivery_order_id', as: 'rating' });
  };

  return DeliveryOrder;
};
