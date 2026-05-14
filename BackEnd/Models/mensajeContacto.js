const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const MensajeContacto = sequelize.define('MensajeContacto', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    correo: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { isEmail: true },
    },
    telefono: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    mensaje: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    respuesta: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    fecha_envio: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    fecha_respuesta: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    estado: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'Pendiente',
      validate: {
        isIn: [['Pendiente', 'Respondido']],
      },
    },
  }, {
    tableName: 'mensajes_contacto',
    timestamps: true,
  });

  // MensajeContacto no tiene asociaciones con otros modelos

  return MensajeContacto;
};
