const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ProducerEarning = sequelize.define('ProducerEarning', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    productor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'usuarios', key: 'id' },
    },
    proforma_id: {
      type: DataTypes.STRING,
      allowNull: false,
      references: { model: 'proformas', key: 'id' },
    },
    proforma_item_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'proforma_items', key: 'id' },
    },
    monto_bruto: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    comision_plataforma: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    porcentaje_comision: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0,
    },
    monto_neto: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    estado: {
      type: DataTypes.ENUM('Pendiente', 'Liquidado', 'Cancelado'),
      allowNull: false,
      defaultValue: 'Pendiente',
    },
    fecha_liquidacion: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    notas: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    tableName: 'producer_earnings',
    timestamps: true,
  });

  ProducerEarning.associate = (models) => {
    ProducerEarning.belongsTo(models.Usuario, { foreignKey: 'productor_id', as: 'productor' });
    ProducerEarning.belongsTo(models.Proforma, { foreignKey: 'proforma_id', as: 'proforma' });
    ProducerEarning.belongsTo(models.ProformaItem, { foreignKey: 'proforma_item_id', as: 'proformaItem' });
  };

  return ProducerEarning;
};
