'use strict';

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    await queryInterface.bulkInsert('platform_settings', [
      {
        clave: 'comision_porcentaje',
        valor: '10',
        descripcion: 'Porcentaje de comisión que retiene la plataforma sobre cada venta de productor (0-100).',
      },
    ], {
      ignoreDuplicates: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('platform_settings', { clave: 'comision_porcentaje' });
  },
};
