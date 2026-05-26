const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Proforma = sequelize.define('Proforma', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      // Formato: PRO-<timestamp>  — se genera en el controller/service
    },
    usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'usuarios', key: 'id' },
    },
    fecha: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    items: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    direccion_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'direcciones', key: 'id' },
    },
    costo_envio: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0,
    },
    notas: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    tableName: 'proformas',
    timestamps: true,
  });

  Proforma.associate = (models) => {
    Proforma.belongsTo(models.Usuario, { foreignKey: 'usuario_id', as: 'usuario' });
    Proforma.belongsTo(models.Direccion, { foreignKey: 'direccion_id', as: 'direccion' });
    Proforma.hasMany(models.ProformaItem, { foreignKey: 'proforma_id', as: 'proformaItems' });
    Proforma.hasMany(models.ProducerEarning, { foreignKey: 'proforma_id', as: 'earnings' });
  };

  return Proforma;
};
