'use strict';
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const DeliveryApplicationDocument = sequelize.define('DeliveryApplicationDocument', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    application_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'delivery_applications',
        key: 'id'
      }
    },
    doc_type: {
      type: DataTypes.STRING(60),
      allowNull: false
    },
    file_path: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    file_name: {
      type: DataTypes.STRING(120),
      allowNull: false
    },
    verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    },
    uploaded_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'delivery_application_documents',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  DeliveryApplicationDocument.associate = (models) => {
    DeliveryApplicationDocument.belongsTo(models.DeliveryApplication, { foreignKey: 'application_id', as: 'application' });
  };

  return DeliveryApplicationDocument;
};
