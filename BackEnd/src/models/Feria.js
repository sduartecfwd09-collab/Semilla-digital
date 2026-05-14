'use strict';
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Feria = sequelize.define('Feria', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  // El frontend usa tanto 'nombre' como 'name' — guardamos ambos o normalizamos
  nombre: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'El nombre de la feria no puede estar vacío.' },
    },
  },
  provincia: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'La provincia no puede estar vacía.' },
      isIn: {
        args: [['San José', 'Alajuela', 'Cartago', 'Heredia', 'Guanacaste', 'Puntarenas', 'Limón', 'Otras']],
        msg: 'La provincia no es válida.',
      },
    },
  },
  direccion: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: '',
  },
  // Días en que opera la feria (ej: "Sábados", "Viernes y Sábados")
  dias: {
    type: DataTypes.STRING(100),
    allowNull: false,
    defaultValue: 'Sábados',
  },
  // Horario (ej: "05:00 - 13:00")
  horario: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: '05:00 - 13:00',
  },
}, {
  tableName: 'ferias',
  timestamps: true,
});

module.exports = Feria;
