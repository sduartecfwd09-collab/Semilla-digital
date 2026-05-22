'use strict';
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const DriverEarnings = sequelize.define('DriverEarnings', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    delivery_order_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'delivery_orders',
        key: 'id'
      }
    },
    driver_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'delivery_drivers',
        key: 'id'
      }
    },
    base_pickup_fee: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: false
    },
    base_dropoff_fee: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: false
    },
    distance_fee: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: false
    },
    time_fee: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: false
    },
    surge_multiplier: {
      type: DataTypes.DECIMAL(4, 2),
      allowNull: false,
      defaultValue: 1.0
    },
    gross_earnings: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: false
    },
    platform_commission_pct: {
      type: DataTypes.DECIMAL(4, 2),
      allowNull: false
    },
    platform_fee: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: false
    },
    net_earnings: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: false
    },
    tips: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: false,
      defaultValue: 0
    },
    total_driver_payout: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: false
    }
  }, {
    tableName: 'driver_earnings',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  DriverEarnings.associate = (models) => {
    DriverEarnings.belongsTo(models.DeliveryOrder, { foreignKey: 'delivery_order_id', as: 'order' });
    DriverEarnings.belongsTo(models.DeliveryDriver, { foreignKey: 'driver_id', as: 'driver' });
  };

  return DriverEarnings;
};
