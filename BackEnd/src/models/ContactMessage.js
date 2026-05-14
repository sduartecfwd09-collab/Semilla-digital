'use strict';
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ContactMessage = sequelize.define('ContactMessage', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre: {
    type: DataTypes.STRING(150),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'El nombre no puede estar vacío.' },
      len: { args: [2, 150], msg: 'El nombre debe tener entre 2 y 150 caracteres.' },
    },
  },
  correo: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      isEmail: { msg: 'El correo no tiene un formato válido.' },
      notEmpty: { msg: 'El correo no puede estar vacío.' },
    },
  },
  telefono: {
    type: DataTypes.STRING(30),
    allowNull: true,
    defaultValue: '',
  },
  mensaje: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'El mensaje no puede estar vacío.' },
      len: { args: [5, 2000], msg: 'El mensaje debe tener entre 5 y 2000 caracteres.' },
    },
  },
  respuesta: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: '',
  },
  fechaEnvio: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  fechaRespuesta: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null,
  },
  estado: {
    type: DataTypes.ENUM('Pendiente', 'Respondido'),
    allowNull: false,
    defaultValue: 'Pendiente',
    validate: {
      isIn: {
        args: [['Pendiente', 'Respondido']],
        msg: 'El estado debe ser Pendiente o Respondido.',
      },
    },
  },
}, {
  tableName: 'contactMessages',
  timestamps: true,
});

module.exports = ContactMessage;
