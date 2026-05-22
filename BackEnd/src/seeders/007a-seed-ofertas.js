'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    const ofertas = [
      // Tomate (id=1)
      { producto_id: 1, feria_id: 1, precio: 850.00,  unidad: 'Kg',     created_at: now, updated_at: now },
      { producto_id: 1, feria_id: 2, precio: 900.00,  unidad: 'Kg',     created_at: now, updated_at: now },
      // Cebolla (id=2)
      { producto_id: 2, feria_id: 1, precio: 600.00,  unidad: 'Kg',     created_at: now, updated_at: now },
      { producto_id: 2, feria_id: 3, precio: 650.00,  unidad: 'Kg',     created_at: now, updated_at: now },
      // Banano (id=3)
      { producto_id: 3, feria_id: 2, precio: 1500.00, unidad: 'Mano',   created_at: now, updated_at: now },
      { producto_id: 3, feria_id: 4, precio: 1400.00, unidad: 'Mano',   created_at: now, updated_at: now },
      // Papa (id=4)
      { producto_id: 4, feria_id: 1, precio: 700.00,  unidad: 'Kg',     created_at: now, updated_at: now },
      { producto_id: 4, feria_id: 3, precio: 720.00,  unidad: 'Kg',     created_at: now, updated_at: now },
      // Zanahoria (id=5)
      { producto_id: 5, feria_id: 2, precio: 550.00,  unidad: 'Kg',     created_at: now, updated_at: now },
      { producto_id: 5, feria_id: 4, precio: 580.00,  unidad: 'Kg',     created_at: now, updated_at: now },
      // Fresa (id=6)
      { producto_id: 6, feria_id: 1, precio: 2500.00, unidad: 'Caja',   created_at: now, updated_at: now },
      { producto_id: 6, feria_id: 2, precio: 2400.00, unidad: 'Caja',   created_at: now, updated_at: now },
      // Lechuga (id=7)
      { producto_id: 7, feria_id: 3, precio: 500.00,  unidad: 'Unidad', created_at: now, updated_at: now },
      { producto_id: 7, feria_id: 4, precio: 480.00,  unidad: 'Unidad', created_at: now, updated_at: now },
      // Sandía (id=8)
      { producto_id: 8, feria_id: 1, precio: 3500.00, unidad: 'Unidad', created_at: now, updated_at: now },
      { producto_id: 8, feria_id: 2, precio: 3200.00, unidad: 'Unidad', created_at: now, updated_at: now },
    ];

    // Solo insertar ofertas cuyos productos y ferias existan,
    // y que no estén ya registradas (producto_id + feria_id).
    const productos = await queryInterface.sequelize.query(
      'SELECT id FROM productos',
      { type: Sequelize.QueryTypes.SELECT }
    );
    const ferias = await queryInterface.sequelize.query(
      'SELECT id FROM ferias',
      { type: Sequelize.QueryTypes.SELECT }
    );
    const existentes = await queryInterface.sequelize.query(
      'SELECT producto_id, feria_id FROM oferta_productos',
      { type: Sequelize.QueryTypes.SELECT }
    );

    const productoIds = new Set(productos.map(p => p.id));
    const feriaIds = new Set(ferias.map(f => f.id));
    const existentesKey = new Set(existentes.map(e => `${e.producto_id}-${e.feria_id}`));

    const toInsert = ofertas.filter(o =>
      productoIds.has(o.producto_id) &&
      feriaIds.has(o.feria_id) &&
      !existentesKey.has(`${o.producto_id}-${o.feria_id}`)
    );

    if (toInsert.length > 0) {
      await queryInterface.bulkInsert('oferta_productos', toInsert, {});
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('oferta_productos', null, {});
  },
};
