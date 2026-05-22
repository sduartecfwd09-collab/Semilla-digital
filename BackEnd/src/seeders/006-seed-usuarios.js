'use strict';
const bcrypt = require('bcrypt');

module.exports = {
  async up(queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash('secret123', 10);
    
    const usuarios = [
      {
        id: 1,
        name: 'Admin AgroMap',
        email: 'admin@agromap.com',
        password: hashedPassword,
        role_id: 1, // Administrador
        status: 'Activo',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 2,
        name: 'Juan Pérez',
        email: 'juan@productor.com',
        password: hashedPassword,
        role_id: 2, // Productor
        status: 'Activo',
        feria_id: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 3,
        name: 'Maria Lopez',
        email: 'maria@usuario.com',
        password: hashedPassword,
        role_id: 3, // Usuario
        status: 'Activo',
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    // Verificar si ya existen
    const existing = await queryInterface.sequelize.query(
      "SELECT id FROM usuarios",
      { type: Sequelize.QueryTypes.SELECT }
    );
    const existingIds = existing.map(u => u.id);
    const toInsert = usuarios.filter(u => !existingIds.includes(u.id));

    if (toInsert.length > 0) {
      await queryInterface.bulkInsert('usuarios', toInsert, {});
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('usuarios', null, {});
  }
};
