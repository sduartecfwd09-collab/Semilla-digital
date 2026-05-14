// ============================================================
// Modelo: Usuario
// Tabla: usuarios
// Descripción: Usuarios del sistema con roles diferenciados
// ============================================================
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Usuario = sequelize.define('Usuario', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'Usuario',
      validate: {
        isIn: [['Administrador', 'Agricultor', 'Usuario']],
      },
    },
    status: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'Activo',
      validate: {
        isIn: [['Activo', 'Inactivo']],
      },
    },
    avatar: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    feria_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'ferias',
        key: 'id',
      },
    },
    direccion_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'direcciones',
        key: 'id',
      },
    },
  }, {
    tableName: 'usuarios',
    timestamps: true,
  });

  Usuario.associate = (models) => {
    // Un usuario pertenece a una feria (opcional)
    Usuario.belongsTo(models.Feria, {
      foreignKey: 'feria_id',
      as: 'feria',
    });

    // Un usuario tiene una dirección (1:1)
    Usuario.belongsTo(models.Direccion, {
      foreignKey: 'direccion_id',
      as: 'direccion',
    });

    // Un usuario tiene muchos productos
    Usuario.hasMany(models.Producto, {
      foreignKey: 'user_id',
      as: 'productos',
    });

    // Un usuario tiene muchas solicitudes de cambio de rol
    Usuario.hasMany(models.SolicitudCambioRol, {
      foreignKey: 'usuario_id',
      as: 'solicitudesCambioRol',
    });

    // Un usuario tiene un puesto de agricultor (1:1)
    Usuario.hasOne(models.PuestoAgricultor, {
      foreignKey: 'usuario_id',
      as: 'puestoAgricultor',
    });

    // Un usuario tiene muchas proformas
    Usuario.hasMany(models.Proforma, {
      foreignKey: 'usuario_id',
      as: 'proformas',
    });
  };

  return Usuario;
};
