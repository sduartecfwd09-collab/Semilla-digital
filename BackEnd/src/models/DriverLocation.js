'use strict';
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const DriverLocation = sequelize.define('DriverLocation', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    driver_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'delivery_drivers',
        key: 'id'
      }
    },
    lat: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: false
    },
    lng: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: false
    },
    recorded_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'driver_locations',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['driver_id', 'recorded_at'] // Recorded at desc usually handled in query
      }
    ]
  });

  DriverLocation.associate = (models) => {
    DriverLocation.belongsTo(models.DeliveryDriver, { foreignKey: 'driver_id', as: 'driver' });
  };

  return DriverLocation;
};
