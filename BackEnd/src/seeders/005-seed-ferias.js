'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const ferias = [
      {
        id: 1, nombre: 'Feria del Agricultor Zapote',
        direccion_id: 1,
        dias: 'Sábado y Domingo', horario: '6:00 AM - 2:00 PM',
        source: 'Municipalidad de San José',
        created_at: new Date(), updated_at: new Date()
      },
      {
        id: 2, nombre: 'Feria del Agricultor Alajuela',
        direccion_id: 2,
        dias: 'Viernes y Sábado', horario: '7:00 AM - 3:00 PM',
        source: 'CAC Alajuela',
        created_at: new Date(), updated_at: new Date()
      },
      {
        id: 3, nombre: 'Feria Borbón',
        direccion_id: 3,
        dias: 'Lunes a Sábado', horario: '5:00 AM - 5:00 PM',
        source: 'Administración Borbón',
        created_at: new Date(), updated_at: new Date()
      },
      {
        id: 4, nombre: 'Feria Palmares',
        direccion_id: 4,
        dias: 'Jueves', horario: '8:00 AM - 4:00 PM',
        source: 'CoopePalmares',
        created_at: new Date(), updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('ferias', ferias, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('ferias', null, {});
  }
};
