'use strict';
const bcrypt = require('bcrypt');

module.exports = {
  async up(queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash('secret123', 10);
    
    const usuarios = [
      {
        id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        name: 'Admin User', nombre: 'Admin AgroMap',
        email: 'admin@agromap.com', password: hashedPassword,
        role: 'Administrador', status: 'Activo',
        created_at: new Date(), updated_at: new Date()
      },
      {
        id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        name: 'Farmer Juan', nombre: 'Juan Pérez',
        email: 'juan@agricultor.com', password: hashedPassword,
        role: 'Agricultor', status: 'Activo',
        feria_id: 1,
        created_at: new Date(), updated_at: new Date()
      },
      {
        id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
        name: 'Regular Maria', nombre: 'Maria Lopez',
        email: 'maria@usuario.com', password: hashedPassword,
        role: 'Usuario', status: 'Activo',
        created_at: new Date(), updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('usuarios', usuarios, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('usuarios', null, {});
  }
};
