'use strict';
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PuestoAgricultor = sequelize.define('PuestoAgricultor', {
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
  nombrePuesto: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'El nombre del puesto no puede estar vacío.' },
    },
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: '',
  },
  // Array de strings con ubicaciones ["Nombre Feria"]
  ubicacion: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
  },
  telefono: {
    type: DataTypes.STRING(30),
    allowNull: true,
    defaultValue: '',
  },
  email: {
    type: DataTypes.STRING(200),
    allowNull: true,
    defaultValue: '',
    validate: {
      isEmailOrEmpty(value) {
        if (value && value.trim() !== '' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          throw new Error('El email del puesto no tiene un formato válido.');
        }
      },
    },
  },
  // Horarios como string combinado o como lista
  horarios: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: '',
  },
  // Lista de horarios estructurada [{dia, inicio, fin}]
  horariosList: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
  },
  feriaId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: null,
  },
  // Tipos de producto que vende
  tiposProducto: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
  },
  // Nombres de fotos subidas
  fotosNombres: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
  },
  // Fotos en base64
  fotosBase64: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
  },
  metodosCultivo: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: '',
  },
  redesSociales: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: '',
  },
  fechaRegistro: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'puestosAgricultor',
  timestamps: true,
});

module.exports = PuestoAgricultor;
