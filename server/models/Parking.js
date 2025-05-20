const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Parking extends Model {
    static associate(models) {
      Parking.hasMany(models.ParkingRecord, {
        foreignKey: 'parkingId',
        as: 'parkingRecords'
      });
    }
  }

  Parking.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    totalSpaces: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1
      }
    },
    availableSpaces: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0
      }
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false
    },
    feePerHour: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    }
  }, {
    sequelize,
    modelName: 'Parking'
  });

  return Parking;
};