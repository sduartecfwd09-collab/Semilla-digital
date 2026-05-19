'use strict';
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const DeliverySetting = sequelize.define('DeliverySetting', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      defaultValue: 1
    },
    base_cost: {
      type: DataTypes.DECIMAL(8, 2),
      defaultValue: 500,
      allowNull: false
    },
    km_rate: {
      type: DataTypes.DECIMAL(6, 2),
      defaultValue: 200,
      allowNull: false
    },
    accept_timeout_seconds: {
      type: DataTypes.INTEGER,
      defaultValue: 15,
      allowNull: false
    },
    max_assignment_attempts: {
      type: DataTypes.INTEGER,
      defaultValue: 3,
      allowNull: false
    },
    retry_interval_seconds: {
      type: DataTypes.INTEGER,
      defaultValue: 30,
      allowNull: false
    },
    max_orders_per_driver: {
      type: DataTypes.INTEGER,
      defaultValue: 3,
      allowNull: false
    },
    score_weight_distance: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 0.50,
      allowNull: false
    },
    score_weight_availability: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 0.20,
      allowNull: false
    },
    score_weight_load: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 0.20,
      allowNull: false
    },
    score_weight_rating: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 0.10,
      allowNull: false
    }
  }, {
    tableName: 'delivery_settings',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  DeliverySetting.associate = (models) => {
    // Global settings typically do not have associations
  };

  return DeliverySetting;
};
