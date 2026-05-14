const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const PuestoFeria = sequelize.define('PuestoFeria', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    puesto_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'puestos_agricultor', key: 'id' },
    },
    feria_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'ferias', key: 'id' },
    },
  }, {
    tableName: 'puesto_ferias',
    timestamps: true,
  });

  return PuestoFeria;
};
