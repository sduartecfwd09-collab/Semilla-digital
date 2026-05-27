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
    accumulated_balance: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      allowNull: false
    },
    last_assigned_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    vehicle_type: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    license_plate: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    selfie_verificacion_url: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    documentos_rutas: {
      type: DataTypes.JSON,
      allowNull: true
    },
    marca_vehiculo: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    modelo_vehiculo: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    anio_vehiculo: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    confirmaciones: {
      type: DataTypes.JSON,
      allowNull: true
    },
    full_name: {
      type: DataTypes.STRING(150),
      allowNull: true
    },
    email: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    phone: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    plate_number: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    brand: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    model: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    identity_document_url: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    criminal_record_url: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    license_url: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    property_card_url: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    riteve_url: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    marchamo_url: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    selfie_verification_url: {
      type: DataTypes.STRING(500),
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
