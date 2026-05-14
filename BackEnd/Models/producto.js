// ============================================================
// Modelo: Producto
// Tabla: productos
// Descripción: Productos agrícolas ofrecidos por los agricultores
// ============================================================
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Producto = sequelize.define('Producto', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'usuarios',
        key: 'id',
      },
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    categoria: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isIn: [['Verduras', 'Frutas', 'Hierbas', 'Tubérculos', 'Granos', 'Proteína', 'Lácteos']],
      },
    },
    emoji: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    disponible: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    unidad: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    imagen: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {
    tableName: 'productos',
    timestamps: true,
  });

  Producto.associate = (models) => {
    // Un producto pertenece a un usuario (agricultor)
    Producto.belongsTo(models.Usuario, {
      foreignKey: 'user_id',
      as: 'usuario',
    });

    // Un producto puede estar en muchas ofertas
    Producto.hasMany(models.OfertaProducto, {
      foreignKey: 'producto_id',
      as: 'ofertas',
    });

    // Un producto puede estar en muchas recetas (vía tabla intermedia)
    Producto.belongsToMany(models.Receta, {
      through: models.RecetaIngrediente,
      foreignKey: 'producto_id',
      otherKey: 'receta_id',
      as: 'recetas',
    });
  };

  return Producto;
};
