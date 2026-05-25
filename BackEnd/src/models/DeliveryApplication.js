'use strict';
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const DeliveryApplication = sequelize.define('DeliveryApplication', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'usuarios',
        key: 'id'
      }
    },
    vehicle_type: {
      type: DataTypes.ENUM('auto', 'moto', 'bicimoto', 'bici'),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'),
      allowNull: false,
      defaultValue: 'PENDING'
    },
    form_data: {
      type: DataTypes.JSON,
      allowNull: true
    },
    submitted_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW
    },
    reviewed_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    reviewed_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'usuarios',
        key: 'id'
      }
    },
    rejection_reason: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'delivery_applications',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  DeliveryApplication.associate = (models) => {
    DeliveryApplication.belongsTo(models.Usuario, { foreignKey: 'user_id', as: 'applicant' });
    DeliveryApplication.belongsTo(models.Usuario, { foreignKey: 'reviewed_by', as: 'reviewer' });
    DeliveryApplication.hasMany(models.DeliveryApplicationDocument, { foreignKey: 'application_id', as: 'documents', onDelete: 'CASCADE' });
  };

  return DeliveryApplication;
};
