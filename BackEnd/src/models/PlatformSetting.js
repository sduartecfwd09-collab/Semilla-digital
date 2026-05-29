const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const PlatformSetting = sequelize.define('PlatformSetting', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    clave: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    valor: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    tableName: 'platform_settings',
    timestamps: false,
    updatedAt: 'updated_at',
  });

  return PlatformSetting;
};
