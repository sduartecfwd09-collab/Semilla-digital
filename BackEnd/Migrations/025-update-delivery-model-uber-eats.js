'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Remove old columns from delivery_orders
    await queryInterface.removeColumn('delivery_orders', 'cargo_weight');
    await queryInterface.removeColumn('delivery_orders', 'supplements');

    // 2. Add new columns to delivery_orders
    await queryInterface.addColumn('delivery_orders', 'commerce_name', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('delivery_orders', 'delivery_notes', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn('delivery_orders', 'item_count', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 1,
    });
    await queryInterface.addColumn('delivery_orders', 'handling_tags', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('delivery_orders', 'estimated_time_mins', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.addColumn('delivery_orders', 'subtotal_items', {
      type: Sequelize.DECIMAL(8, 2),
      allowNull: true,
    });
    await queryInterface.addColumn('delivery_orders', 'delivery_fee', {
      type: Sequelize.DECIMAL(8, 2),
      allowNull: true,
    });
    await queryInterface.addColumn('delivery_orders', 'total_customer_cost', {
      type: Sequelize.DECIMAL(8, 2),
      allowNull: true,
    });

    // 3. Create driver_earnings table
    await queryInterface.createTable('driver_earnings', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      delivery_order_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'delivery_orders',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      driver_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'delivery_drivers',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      base_pickup_fee: {
        type: Sequelize.DECIMAL(8, 2),
        allowNull: false,
      },
      base_dropoff_fee: {
        type: Sequelize.DECIMAL(8, 2),
        allowNull: false,
      },
      distance_fee: {
        type: Sequelize.DECIMAL(8, 2),
        allowNull: false,
      },
      time_fee: {
        type: Sequelize.DECIMAL(8, 2),
        allowNull: false,
      },
      surge_multiplier: {
        type: Sequelize.DECIMAL(4, 2),
        allowNull: false,
        defaultValue: 1.0,
      },
      gross_earnings: {
        type: Sequelize.DECIMAL(8, 2),
        allowNull: false,
      },
      platform_commission_pct: {
        type: Sequelize.DECIMAL(4, 2),
        allowNull: false,
      },
      platform_fee: {
        type: Sequelize.DECIMAL(8, 2),
        allowNull: false,
      },
      net_earnings: {
        type: Sequelize.DECIMAL(8, 2),
        allowNull: false,
      },
      tips: {
        type: Sequelize.DECIMAL(8, 2),
        allowNull: false,
        defaultValue: 0,
      },
      total_driver_payout: {
        type: Sequelize.DECIMAL(8, 2),
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    // 1. Drop driver_earnings table
    await queryInterface.dropTable('driver_earnings');

    // 2. Remove added columns from delivery_orders
    await queryInterface.removeColumn('delivery_orders', 'commerce_name');
    await queryInterface.removeColumn('delivery_orders', 'delivery_notes');
    await queryInterface.removeColumn('delivery_orders', 'item_count');
    await queryInterface.removeColumn('delivery_orders', 'handling_tags');
    await queryInterface.removeColumn('delivery_orders', 'estimated_time_mins');
    await queryInterface.removeColumn('delivery_orders', 'subtotal_items');
    await queryInterface.removeColumn('delivery_orders', 'delivery_fee');
    await queryInterface.removeColumn('delivery_orders', 'total_customer_cost');

    // 3. Add back old columns
    await queryInterface.addColumn('delivery_orders', 'cargo_weight', {
      type: Sequelize.DECIMAL(6, 2),
      allowNull: true,
      defaultValue: 0
    });
    await queryInterface.addColumn('delivery_orders', 'supplements', {
      type: Sequelize.DECIMAL(8, 2),
      allowNull: true,
      defaultValue: 0
    });
  }
};
