const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const PuestoFeria = sequelize.define('PuestoFeria', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    puesto_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'puestos_productor', key: 'id' },
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
