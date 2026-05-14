'use strict';
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Usuario = sequelize.define('Usuario', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(150),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'El nombre no puede estar vacío.' },
      len: { args: [2, 150], msg: 'El nombre debe tener entre 2 y 150 caracteres.' },
    },
  },
  email: {
    type: DataTypes.STRING(200),
    allowNull: false,
    unique: { msg: 'Este correo electrónico ya está registrado.' },
    validate: {
      isEmail: { msg: 'El correo electrónico no tiene un formato válido.' },
      notEmpty: { msg: 'El correo no puede estar vacío.' },
    },
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'La contraseña no puede estar vacía.' },
      len: { args: [3, 255], msg: 'La contraseña debe tener al menos 3 caracteres.' },
    },
  },
  role: {
    type: DataTypes.ENUM('Administrador', 'Agricultor', 'Usuario'),
    allowNull: false,
    defaultValue: 'Usuario',
    validate: {
      isIn: {
        args: [['Administrador', 'Agricultor', 'Usuario']],
        msg: 'El rol debe ser Administrador, Agricultor o Usuario.',
      },
    },
  },
  status: {
    type: DataTypes.ENUM('Activo', 'Inactivo'),
    allowNull: false,
    defaultValue: 'Activo',
    validate: {
      isIn: {
        args: [['Activo', 'Inactivo']],
        msg: 'El estado debe ser Activo o Inactivo.',
      },
    },
  },
  avatar: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: null,
  },
  // ID de la feria asignada al agricultor (referencia lógica, no FK estricta para mantener compatibilidad)
  feriaId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: null,
  },
  // Información adicional del puesto almacenada como JSON (uso interno del frontend)
  puestoInfo: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: null,
  },
}, {
  tableName: 'usuarios',
  timestamps: true,
});

module.exports = Usuario;
