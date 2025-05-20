const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Vehicle extends Model {
    static associate(models) {
      Vehicle.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });
      Vehicle.hasMany(models.ParkingRecord, {
        foreignKey: 'vehicleId',
        as: 'parkingRecords'
      });
    }
  }

  Vehicle.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    plateNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true
      }
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'Vehicle',
    indexes: [
      {
        fields: ['plateNumber']
      }
    ]
  });

  return Vehicle;
};
