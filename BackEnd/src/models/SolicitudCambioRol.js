// ============================================================
// Modelo: SolicitudCambioRol
// Tabla: solicitudes_cambio_rol
// Descripción: Solicitudes de usuarios para cambiar de rol
// ============================================================
const { DataTypes } = require('sequelize');
const { VEHICLE_TYPES } = require('../constants/vehicleTypes');

module.exports = (sequelize) => {
  const SolicitudCambioRol = sequelize.define('SolicitudCambioRol', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'usuarios',
        key: 'id',
      },
    },
    nombre_usuario: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    nombre_del_puesto: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    correo_usuario: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    rol_solicitado: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    vehicle_type: {
      type: DataTypes.STRING(50),
      allowNull: true,
      validate: {
        isIn: {
          args: [VEHICLE_TYPES],
          msg: `vehicle_type debe ser uno de: ${VEHICLE_TYPES.join(', ')}`,
        },
      },
    },
    license_plate: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    estado: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'Pendiente',
      validate: {
        isIn: [['Pendiente', 'Aprobada', 'Rechazada']],
      },
    },
    fecha_solicitud: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    motivo_respuesta: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    fecha_respuesta: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    selfie_verificacion_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    documentos_rutas: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    marca_vehiculo: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    modelo_vehiculo: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    anio_vehiculo: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    confirmaciones: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  }, {
    tableName: 'solicitudes_cambio_rol',
    timestamps: true,
  });

  SolicitudCambioRol.associate = (models) => {
    // Una solicitud pertenece a un usuario
    SolicitudCambioRol.belongsTo(models.Usuario, {
      foreignKey: 'usuario_id',
      as: 'usuario',
      onDelete: 'CASCADE',
    });
  };

  return SolicitudCambioRol;
};
