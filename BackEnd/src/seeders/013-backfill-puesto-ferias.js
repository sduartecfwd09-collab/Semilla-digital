'use strict';

// ============================================================
// Backfill idempotente: puesto_ferias
// ------------------------------------------------------------
// Garantiza que todo puesto existente con feria principal tenga
// la fila correspondiente en puesto_ferias (fuente de verdad de
// autorización, Enfoque B). Pensado para ambientes con datos
// reales previos al refactor de 3b — en dev tras correr el
// seeder 006 esto suele ser no-op.
// ============================================================

module.exports = {
  async up(queryInterface, Sequelize) {
    const puestos = await queryInterface.sequelize.query(
      'SELECT id, feria_id FROM puestos_productor WHERE feria_id IS NOT NULL',
      { type: Sequelize.QueryTypes.SELECT }
    );
    if (puestos.length === 0) return;

    const existentes = await queryInterface.sequelize.query(
      'SELECT puesto_id, feria_id FROM puesto_ferias',
      { type: Sequelize.QueryTypes.SELECT }
    );
    const existentesKey = new Set(
      existentes.map(pf => `${pf.puesto_id}:${pf.feria_id}`)
    );

    const now = new Date();
    const toInsert = puestos
      .filter(p => !existentesKey.has(`${p.id}:${p.feria_id}`))
      .map(p => ({
        puesto_id: p.id,
        feria_id: p.feria_id,
        created_at: now,
        updated_at: now,
      }));

    if (toInsert.length > 0) {
      await queryInterface.bulkInsert('puesto_ferias', toInsert, {});
    }
  },

  // No revertir: este backfill solo agrega autorizaciones faltantes.
  // Borrarlas dejaría productores sin poder vender en su propia feria.
  async down() {},
};
