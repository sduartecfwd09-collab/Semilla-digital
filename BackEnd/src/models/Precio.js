'use strict';
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Precio = sequelize.define('Precio', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  productoId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'productos', key: 'id' },
    validate: {
      notNull: { msg: 'El productoId es obligatorio.' },
      isInt: { msg: 'El productoId debe ser un número entero.' },
    },
  },
  feriaId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: null,
  },
  feriaNombre: {
    type: DataTypes.STRING(200),
    allowNull: true,
    defaultValue: '',
  },
  provincia: {
    type: DataTypes.STRING(100),
    allowNull: true,
    defaultValue: '',
  },
  precio: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    validate: {
      isDecimal: { msg: 'El precio debe ser un número válido.' },
      min: { args: [0], msg: 'El precio no puede ser negativo.' },
    },
  },
}, {
  tableName: 'precios',
  timestamps: true,
});

module.exports = Precio;
