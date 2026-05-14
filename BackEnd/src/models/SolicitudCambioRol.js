'use strict';
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SolicitudCambioRol = sequelize.define('SolicitudCambioRol', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  usuarioId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'usuarios', key: 'id' },
    validate: {
      notNull: { msg: 'El usuarioId es obligatorio.' },
      isInt: { msg: 'El usuarioId debe ser un número entero.' },
    },
  },
  nombreDelPuesto: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'El nombre del puesto no puede estar vacío.' },
    },
  },
  correoUsuario: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      isEmail: { msg: 'El correo del usuario no tiene un formato válido.' },
      notEmpty: { msg: 'El correo no puede estar vacío.' },
    },
  },
  rolSolicitado: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'Agricultor',
  },
  estado: {
    type: DataTypes.ENUM('Pendiente', 'Aprobada', 'Rechazada'),
    allowNull: false,
    defaultValue: 'Pendiente',
    validate: {
      isIn: {
        args: [['Pendiente', 'Aprobada', 'Rechazada']],
        msg: 'El estado debe ser Pendiente, Aprobada o Rechazada.',
      },
    },
  },
  motivoRespuesta: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: '',
  },
  fechaSolicitud: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  fechaRespuesta: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null,
  },
}, {
  tableName: 'solicitudesCambioRol',
  timestamps: true,
});

module.exports = SolicitudCambioRol;
