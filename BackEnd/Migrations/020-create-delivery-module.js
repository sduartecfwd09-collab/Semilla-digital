'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. delivery_drivers
    await queryInterface.createTable('delivery_drivers', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: 'usuarios', // Or 'users' if it exists, mapping to 'usuarios' as it's the existing users table
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      status: {
        type: Sequelize.ENUM('OFFLINE', 'AVAILABLE', 'BUSY'),
        allowNull: false,
        defaultValue: 'OFFLINE'
      },
      current_lat: {
        type: Sequelize.DECIMAL(10, 7),
        allowNull: true
      },
      current_lng: {
        type: Sequelize.DECIMAL(10, 7),
        allowNull: true
      },
      rating: {
        type: Sequelize.DECIMAL(3, 2),
        defaultValue: 5.00,
        allowNull: false
      },
      active_orders: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      max_orders: {
        type: Sequelize.INTEGER,
        defaultValue: 3,
        allowNull: false
      },
      last_assigned_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.addIndex('delivery_drivers', ['user_id']);
    await queryInterface.addIndex('delivery_drivers', ['status']);

    // 2. delivery_applications
    await queryInterface.createTable('delivery_applications', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'usuarios',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      vehicle_type: {
        type: Sequelize.ENUM('auto', 'moto', 'bicimoto', 'bici'),
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'),
        allowNull: false,
        defaultValue: 'PENDING'
      },
      form_data: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      submitted_at: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      reviewed_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      reviewed_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'usuarios',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      rejection_reason: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.addIndex('delivery_applications', ['user_id']);
    await queryInterface.addIndex('delivery_applications', ['vehicle_type']);
    await queryInterface.addIndex('delivery_applications', ['status']);

    // 3. delivery_application_documents
    await queryInterface.createTable('delivery_application_documents', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      application_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'delivery_applications',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      doc_type: {
        type: Sequelize.STRING(60),
        allowNull: false
      },
      file_path: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      file_name: {
        type: Sequelize.STRING(120),
        allowNull: false
      },
      verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      uploaded_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.addIndex('delivery_application_documents', ['application_id']);

    // 4. delivery_orders
    await queryInterface.createTable('delivery_orders', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      order_id: {
        type: Sequelize.INTEGER, // Adjust if orders.id is not INTEGER
        allowNull: false,
        references: {
          model: 'orders', // Existing table
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      driver_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'delivery_drivers',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      status: {
        type: Sequelize.ENUM('CREATED', 'PENDING', 'QUEUED', 'ASSIGNED', 'ACCEPTED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'MANUAL_REVIEW', 'CANCELLED'),
        allowNull: false,
        defaultValue: 'CREATED'
      },
      pickup_address: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      pickup_lat: {
        type: Sequelize.DECIMAL(10, 7),
        allowNull: true
      },
      pickup_lng: {
        type: Sequelize.DECIMAL(10, 7),
        allowNull: true
      },
      dropoff_address: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      dropoff_lat: {
        type: Sequelize.DECIMAL(10, 7),
        allowNull: true
      },
      dropoff_lng: {
        type: Sequelize.DECIMAL(10, 7),
        allowNull: true
      },
      distance_km: {
        type: Sequelize.DECIMAL(6, 2),
        allowNull: true
      },
      eta_minutes: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      base_cost: {
        type: Sequelize.DECIMAL(8, 2),
        allowNull: true
      },
      km_rate: {
        type: Sequelize.DECIMAL(6, 2),
        allowNull: true
      },
      total_cost: {
        type: Sequelize.DECIMAL(8, 2),
        allowNull: true
      },
      assignment_attempts: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      assigned_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      accepted_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      picked_up_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      delivered_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.addIndex('delivery_orders', ['order_id']);
    await queryInterface.addIndex('delivery_orders', ['driver_id']);
    await queryInterface.addIndex('delivery_orders', ['status']);

    // 5. driver_locations
    await queryInterface.createTable('driver_locations', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      driver_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'delivery_drivers',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      lat: {
        type: Sequelize.DECIMAL(10, 7),
        allowNull: false
      },
      lng: {
        type: Sequelize.DECIMAL(10, 7),
        allowNull: false
      },
      recorded_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.addIndex('driver_locations', ['driver_id', 'recorded_at']);

    // 6. delivery_ratings
    await queryInterface.createTable('delivery_ratings', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      delivery_order_id: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
        references: {
          model: 'delivery_orders',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      score: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      comment: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // 7. delivery_settings
    await queryInterface.createTable('delivery_settings', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        defaultValue: 1
      },
      base_cost: {
        type: Sequelize.DECIMAL(8, 2),
        defaultValue: 500,
        allowNull: false
      },
      km_rate: {
        type: Sequelize.DECIMAL(6, 2),
        defaultValue: 200,
        allowNull: false
      },
      accept_timeout_seconds: {
        type: Sequelize.INTEGER,
        defaultValue: 15,
        allowNull: false
      },
      max_assignment_attempts: {
        type: Sequelize.INTEGER,
        defaultValue: 3,
        allowNull: false
      },
      retry_interval_seconds: {
        type: Sequelize.INTEGER,
        defaultValue: 30,
        allowNull: false
      },
      max_orders_per_driver: {
        type: Sequelize.INTEGER,
        defaultValue: 3,
        allowNull: false
      },
      score_weight_distance: {
        type: Sequelize.DECIMAL(3, 2),
        defaultValue: 0.50,
        allowNull: false
      },
      score_weight_availability: {
        type: Sequelize.DECIMAL(3, 2),
        defaultValue: 0.20,
        allowNull: false
      },
      score_weight_load: {
        type: Sequelize.DECIMAL(3, 2),
        defaultValue: 0.20,
        allowNull: false
      },
      score_weight_rating: {
        type: Sequelize.DECIMAL(3, 2),
        defaultValue: 0.10,
        allowNull: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('delivery_settings');
    await queryInterface.dropTable('delivery_ratings');
    await queryInterface.dropTable('driver_locations');
    await queryInterface.dropTable('delivery_orders');
    await queryInterface.dropTable('delivery_application_documents');
    await queryInterface.dropTable('delivery_applications');
    await queryInterface.dropTable('delivery_drivers');
  }
};
