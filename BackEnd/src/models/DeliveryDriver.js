const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const DeliveryDriver = sequelize.define('DeliveryDriver', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'usuarios', key: 'id' },
      onDelete: 'CASCADE',
    },
    vehicle_type: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    license_plate: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'busy'),
      allowNull: false,
      defaultValue: 'inactive',
    },
  }, {
    tableName: 'delivery_drivers',
    timestamps: true,
  });

  DeliveryDriver.associate = (models) => {
    DeliveryDriver.belongsTo(models.Usuario, { foreignKey: 'usuario_id', as: 'usuario' });
    DeliveryDriver.hasMany(models.DeliveryOrder, { foreignKey: 'driver_id', as: 'orders' });
    DeliveryDriver.hasMany(models.DriverLocation, { foreignKey: 'driver_id', as: 'locations' });
    DeliveryDriver.hasMany(models.DeliveryRating, { foreignKey: 'driver_id', as: 'ratings' });
  };

  return DeliveryDriver;
};
