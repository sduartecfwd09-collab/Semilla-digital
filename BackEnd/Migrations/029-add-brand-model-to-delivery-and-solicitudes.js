'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // ── solicitudes_cambio_rol ──────────────────────────────────
    const solicitudesTableInfo = await queryInterface.describeTable('solicitudes_cambio_rol');

    if (!solicitudesTableInfo.marca_vehiculo) {
      await queryInterface.addColumn('solicitudes_cambio_rol', 'marca_vehiculo', {
        type: Sequelize.STRING(100),
        allowNull: true,
      });
    }

    if (!solicitudesTableInfo.modelo_vehiculo) {
      await queryInterface.addColumn('solicitudes_cambio_rol', 'modelo_vehiculo', {
        type: Sequelize.STRING(100),
        allowNull: true,
      });
    }

    if (!solicitudesTableInfo.anio_vehiculo) {
      await queryInterface.addColumn('solicitudes_cambio_rol', 'anio_vehiculo', {
        type: Sequelize.INTEGER,
        allowNull: true,
      });
    }

    if (!solicitudesTableInfo.confirmaciones) {
      await queryInterface.addColumn('solicitudes_cambio_rol', 'confirmaciones', {
        type: Sequelize.JSON,
        allowNull: true,
      });
    }

    // ── delivery_drivers ────────────────────────────────────────
    const driversTableInfo = await queryInterface.describeTable('delivery_drivers');

    if (!driversTableInfo.marca_vehiculo) {
      await queryInterface.addColumn('delivery_drivers', 'marca_vehiculo', {
        type: Sequelize.STRING(100),
        allowNull: true,
      });
    }

    if (!driversTableInfo.modelo_vehiculo) {
      await queryInterface.addColumn('delivery_drivers', 'modelo_vehiculo', {
        type: Sequelize.STRING(100),
        allowNull: true,
      });
    }

    if (!driversTableInfo.anio_vehiculo) {
      await queryInterface.addColumn('delivery_drivers', 'anio_vehiculo', {
        type: Sequelize.INTEGER,
        allowNull: true,
      });
    }

    if (!driversTableInfo.confirmaciones) {
      await queryInterface.addColumn('delivery_drivers', 'confirmaciones', {
        type: Sequelize.JSON,
        allowNull: true,
      });
    }
  },

  async down(queryInterface) {
    // ── solicitudes_cambio_rol ──────────────────────────────────
    await queryInterface.removeColumn('solicitudes_cambio_rol', 'marca_vehiculo').catch(() => {});
    await queryInterface.removeColumn('solicitudes_cambio_rol', 'modelo_vehiculo').catch(() => {});
    await queryInterface.removeColumn('solicitudes_cambio_rol', 'anio_vehiculo').catch(() => {});
    await queryInterface.removeColumn('solicitudes_cambio_rol', 'confirmaciones').catch(() => {});

    // ── delivery_drivers ────────────────────────────────────────
    await queryInterface.removeColumn('delivery_drivers', 'marca_vehiculo').catch(() => {});
    await queryInterface.removeColumn('delivery_drivers', 'modelo_vehiculo').catch(() => {});
    await queryInterface.removeColumn('delivery_drivers', 'anio_vehiculo').catch(() => {});
    await queryInterface.removeColumn('delivery_drivers', 'confirmaciones').catch(() => {});
  },
};
