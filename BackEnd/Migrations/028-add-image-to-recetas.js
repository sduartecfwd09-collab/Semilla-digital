'use strict';

/**
 * Migración 028 — Agrega columna image_url a la tabla recetas.
 * Permite asociar a cada receta una URL de imagen alojada en Cloudinary.
 */
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('recetas', 'image_url', {
      type: Sequelize.STRING(500),
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('recetas', 'image_url');
  },
};
