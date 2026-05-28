'use strict';

/**
 * Elimina las tablas huérfanas `delivery_applications` y
 * `delivery_application_documents` (creadas por la migration 020 pero
 * nunca consultadas: el flujo real de aprobación de repartidores usa
 * `solicitudes_cambio_rol` + `delivery_drivers`).
 *
 * Validado contra BD viva (audit_dead_code.js) antes del drop:
 *   - 0 filas en delivery_applications
 *   - 0 filas en delivery_application_documents
 *   - 0 FKs externas (solo la interna documents → applications)
 *
 * Idempotente: chequea existencia antes de dropear.
 * Orden: documents primero (por FK), después applications.
 */
module.exports = {
  async up(queryInterface) {
    const dialect = queryInterface.sequelize.getDialect();
    const dbNameExpr = dialect === 'mysql' ? 'DATABASE()' : 'current_schema()';

    const [docExists] = await queryInterface.sequelize.query(
      `SELECT COUNT(*) AS c FROM information_schema.tables
       WHERE table_schema = ${dbNameExpr} AND table_name = 'delivery_application_documents'`
    );
    if (docExists[0].c > 0) {
      await queryInterface.dropTable('delivery_application_documents');
    }

    const [appExists] = await queryInterface.sequelize.query(
      `SELECT COUNT(*) AS c FROM information_schema.tables
       WHERE table_schema = ${dbNameExpr} AND table_name = 'delivery_applications'`
    );
    if (appExists[0].c > 0) {
      await queryInterface.dropTable('delivery_applications');
    }
  },

  /**
   * Rollback: recrea las tablas con el schema original de la migration 020.
   * Solo crea las columnas mínimas necesarias para restablecer el schema;
   * los datos perdidos NO se recuperan.
   */
  async down(queryInterface, Sequelize) {
    await queryInterface.createTable('delivery_applications', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'usuarios', key: 'id' },
      },
      vehicle_type: {
        type: Sequelize.ENUM('auto', 'moto', 'bicimoto', 'bici'),
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'),
        allowNull: false,
        defaultValue: 'PENDING',
      },
      form_data: { type: Sequelize.JSON, allowNull: true },
      submitted_at: { type: Sequelize.DATE, allowNull: true, defaultValue: Sequelize.NOW },
      reviewed_at: { type: Sequelize.DATE, allowNull: true },
      reviewed_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'usuarios', key: 'id' },
      },
      rejection_reason: { type: Sequelize.TEXT, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    });

    await queryInterface.createTable('delivery_application_documents', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      application_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'delivery_applications', key: 'id' },
        onDelete: 'CASCADE',
      },
      document_type: { type: Sequelize.STRING(50), allowNull: false },
      file_url: { type: Sequelize.STRING(500), allowNull: false },
      uploaded_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    });
  },
};
