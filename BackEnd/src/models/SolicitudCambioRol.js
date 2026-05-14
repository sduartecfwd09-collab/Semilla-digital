// ============================================================
// Modelo: SolicitudCambioRol
// Tabla: solicitudes_cambio_rol
// Descripción: Solicitudes de usuarios para cambiar de rol
// ============================================================
const { DataTypes } = require('sequelize');

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
