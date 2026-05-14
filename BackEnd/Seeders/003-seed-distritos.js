'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const distritos = [];
    let idCounter = 1;

    // Generar 2 distritos por cada uno de los 21 cantones (ID 1-21)
    for (let cantonId = 1; cantonId <= 21; cantonId++) {
      distritos.push({
        id: idCounter++,
        nombre: `Distrito Central ${cantonId}`,
        canton_id: cantonId,
        created_at: new Date(),
        updated_at: new Date()
      });
      distritos.push({
        id: idCounter++,
        nombre: `Distrito Secundario ${cantonId}`,
        canton_id: cantonId,
        created_at: new Date(),
        updated_at: new Date()
      });
    }

    await queryInterface.bulkInsert('distritos', distritos, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('distritos', null, {});
  }
};
