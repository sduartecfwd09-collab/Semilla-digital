'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
  async up(queryInterface, Sequelize) {
    const recetas = [
      {
        id: uuidv4(),
        title: 'Ensalada Rápida de Tomate',
        description: 'Una ensalada fresca y rápida con tomates de feria.',
        difficulty: 'Fácil',
        time: '15 min',
        ingredients: JSON.stringify(['4 Tomates grandes', '1 Cebolla pequeña', 'Sal al gusto', 'Aceite de oliva']),
        steps: JSON.stringify(['Lavar los tomates', 'Picar los tomates en rodajas', 'Picar la cebolla finamente', 'Mezclar y sazonar']),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        title: 'Gallo Pinto Tradicional',
        description: 'El desayuno clásico costarricense.',
        difficulty: 'Medio',
        time: '30 min',
        ingredients: JSON.stringify(['3 tazas de arroz cocido', '2 tazas de frijoles negros', '1 Cebolla', '1 Chile dulce', 'Culantro', 'Salsa Lizano']),
        steps: JSON.stringify(['Sofreír los olores', 'Agregar los frijoles con un poco de caldo', 'Incorporar el arroz y mezclar bien', 'Agregar salsa Lizano y culantro al final']),
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('recetas', recetas, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('recetas', null, {});
  }
};
