'use strict';
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const DeliveryDriver = sequelize.define('DeliveryDriver', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: {
        model: 'usuarios',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.ENUM('OFFLINE', 'AVAILABLE', 'BUSY'),
      allowNull: false,
      defaultValue: 'OFFLINE'
    },
    current_lat: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: true
    },
    current_lng: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: true
    },
    rating: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 5.00,
      allowNull: false
    },
    active_orders: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false
    },
    max_orders: {
      type: DataTypes.INTEGER,
      defaultValue: 3,
      allowNull: false
    },
    last_assigned_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'delivery_drivers',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  DeliveryDriver.associate = (models) => {
    DeliveryDriver.belongsTo(models.Usuario, { foreignKey: 'user_id', as: 'usuario' });
    DeliveryDriver.hasMany(models.DeliveryOrder, { foreignKey: 'driver_id', as: 'orders' });
    DeliveryDriver.hasMany(models.DriverLocation, { foreignKey: 'driver_id', as: 'locations' });
  };

  return DeliveryDriver;
};
