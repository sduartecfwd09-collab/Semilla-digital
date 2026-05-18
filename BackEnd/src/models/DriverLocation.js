const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const DriverLocation = sequelize.define('DriverLocation', {
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
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: false,
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: false,
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'driver_locations',
    timestamps: true,
  });

  DriverLocation.associate = (models) => {
    DriverLocation.belongsTo(models.DeliveryDriver, { foreignKey: 'driver_id', as: 'driver' });
  };

  return DriverLocation;
};
