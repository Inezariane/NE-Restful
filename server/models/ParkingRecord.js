const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class ParkingRecord extends Model {
    static associate(models) {
      ParkingRecord.belongsTo(models.Parking, {
        foreignKey: 'parkingId',
        as: 'parking'
      });
      ParkingRecord.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });
      ParkingRecord.belongsTo(models.Vehicle, {
        foreignKey: 'vehicleId',
        as: 'vehicle'
      });
    }
  }

  ParkingRecord.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    vehicleId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Vehicles',
        key: 'id'
      }
    },
    parkingId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Parkings',
        key: 'id'
      }
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    entryDateTime: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    exitDateTime: {
      type: DataTypes.DATE,
      allowNull: true
    },
    chargedAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    },
    ticketNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    }
  }, {
    sequelize,
    modelName: 'ParkingRecord',
    indexes: [
      {
        fields: ['vehicleId']
      },
      {
        fields: ['ticketNumber']
      }
    ]
  });

  return ParkingRecord;
};