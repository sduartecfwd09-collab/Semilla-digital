'use strict';
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Receta = sequelize.define('Receta', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'El título de la receta no puede estar vacío.' },
      len: { args: [2, 200], msg: 'El título debe tener entre 2 y 200 caracteres.' },
    },
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'La descripción no puede estar vacía.' },
    },
  },
  // Array de strings ["ingrediente 1", "ingrediente 2"]
  ingredients: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: [],
    validate: {
      isArray(value) {
        if (!Array.isArray(value)) throw new Error('Los ingredientes deben ser un arreglo.');
        if (value.length === 0) throw new Error('Debe incluir al menos un ingrediente.');
      },
    },
  },
  // Array de pasos ["Paso 1...", "Paso 2..."]
  steps: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: [],
    validate: {
      isArray(value) {
        if (!Array.isArray(value)) throw new Error('Los pasos deben ser un arreglo.');
        if (value.length === 0) throw new Error('Debe incluir al menos un paso.');
      },
    },
  },
  difficulty: {
    type: DataTypes.ENUM('Fácil', 'Media', 'Difícil'),
    allowNull: false,
    defaultValue: 'Fácil',
    validate: {
      isIn: {
        args: [['Fácil', 'Media', 'Difícil']],
        msg: 'La dificultad debe ser Fácil, Media o Difícil.',
      },
    },
  },
  // Tiempo como string "30 min"
  time: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'El tiempo no puede estar vacío.' },
    },
  },
}, {
  tableName: 'recetas',
  timestamps: true,
});

module.exports = Receta;
