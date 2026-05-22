const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const PuestoProductor = sequelize.define('PuestoProductor', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: { model: 'usuarios', key: 'id' },
    },
    feria_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'ferias', key: 'id' },
    },
    direccion_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'direcciones', key: 'id' },
    },
    nombre_puesto: { type: DataTypes.STRING, allowNull: false },
    descripcion: { type: DataTypes.TEXT, allowNull: true },
    telefono: { type: DataTypes.STRING, allowNull: true },
    email: { type: DataTypes.STRING, allowNull: true },
    horarios: { type: DataTypes.STRING, allowNull: true },
    horarios_list: { type: DataTypes.JSON, allowNull: true },
    tipos_producto: { type: DataTypes.JSON, allowNull: true },
    metodos_cultivo: { type: DataTypes.TEXT, allowNull: true },
    redes_sociales: { type: DataTypes.STRING, allowNull: true },
    fotos_base64: { type: DataTypes.JSON, allowNull: true },
    fotos_nombres: { type: DataTypes.JSON, allowNull: true },
    fecha_registro: { type: DataTypes.DATE, allowNull: true, defaultValue: DataTypes.NOW },
  }, {
    tableName: 'puestos_productor',
    timestamps: true,
  });

  PuestoProductor.associate = (models) => {
    PuestoProductor.belongsTo(models.Usuario, { foreignKey: 'usuario_id', as: 'usuario' });
    PuestoProductor.belongsTo(models.Feria, { foreignKey: 'feria_id', as: 'feriaPrincipal' });
    PuestoProductor.belongsTo(models.Direccion, { foreignKey: 'direccion_id', as: 'direccion' });
    PuestoProductor.belongsToMany(models.Feria, {
      through: models.PuestoFeria, foreignKey: 'puesto_id', otherKey: 'feria_id', as: 'ferias',
    });
  };

  return PuestoProductor;
};
