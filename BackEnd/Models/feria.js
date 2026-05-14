// ============================================================
// Modelo: Feria
// Tabla: ferias
// Descripción: Ferias del agricultor / mercados locales
// ============================================================
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Feria = sequelize.define('Feria', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    direccion_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'direcciones',
        key: 'id',
      },
    },
    dias: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    horario: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    source: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {
    tableName: 'ferias',
    timestamps: true,
  });

  Feria.associate = (models) => {
    // Una feria tiene una dirección (1:1)
    Feria.belongsTo(models.Direccion, {
      foreignKey: 'direccion_id',
      as: 'direccion',
    });

    // Una feria tiene muchos usuarios
    Feria.hasMany(models.Usuario, {
      foreignKey: 'feria_id',
      as: 'usuarios',
    });

    // Una feria tiene muchos puestos (vía tabla intermedia)
    Feria.belongsToMany(models.PuestoAgricultor, {
      through: models.PuestoFeria,
      foreignKey: 'feria_id',
      otherKey: 'puesto_id',
      as: 'puestos',
    });

    // Una feria tiene muchas ofertas de productos
    Feria.hasMany(models.OfertaProducto, {
      foreignKey: 'feria_id',
      as: 'ofertaProductos',
    });

    // Relación directa con puestos de agricultor
    Feria.hasMany(models.PuestoAgricultor, {
      foreignKey: 'feria_id',
      as: 'puestosDirectos',
    });
  };

  return Feria;
};
