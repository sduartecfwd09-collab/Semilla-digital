'use strict';
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Producto = sequelize.define('Producto', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'usuarios', key: 'id' },
    validate: {
      notNull: { msg: 'El userId es obligatorio.' },
      isInt: { msg: 'El userId debe ser un número entero.' },
    },
  },
  nombre: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'El nombre del producto no puede estar vacío.' },
      len: { args: [1, 200], msg: 'El nombre debe tener entre 1 y 200 caracteres.' },
    },
  },
  // Emoji representativo de la categoría
  emoji: {
    type: DataTypes.STRING(10),
    allowNull: true,
    defaultValue: '📦',
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: '',
  },
  categoria: {
    type: DataTypes.STRING(100),
    allowNull: false,
    defaultValue: 'Otros',
    validate: {
      notEmpty: { msg: 'La categoría no puede estar vacía.' },
    },
  },
  imagen: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: '',
  },
  disponible: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  unidad: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'Kilogramo',
  },
  provincia: {
    type: DataTypes.STRING(100),
    allowNull: true,
    defaultValue: '',
  },
  direccionPuesto: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: '',
  },
}, {
  tableName: 'productos',
  timestamps: true,
});

module.exports = Producto;
