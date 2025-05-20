'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ParkingRecords', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      plateNumber: {
        type: Sequelize.STRING,
        allowNull: false
      },
      parkingId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Parkings',
          key: 'id'
        }
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      entryDateTime: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      exitDateTime: {
        type: Sequelize.DATE,
        allowNull: true
      },
      chargedAmount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      ticketNumber: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.addIndex('ParkingRecords', ['plateNumber']);
    await queryInterface.addIndex('ParkingRecords', ['ticketNumber']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ParkingRecords');
  }
};