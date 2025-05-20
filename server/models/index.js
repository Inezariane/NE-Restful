const { Sequelize } = require('sequelize');
const config = require('../config/database');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
  host: dbConfig.host,
  port: dbConfig.port,
  dialect: dbConfig.dialect,
  logging: dbConfig.logging
});

// Load models
const models = {
  User: require('./user')(sequelize),
  Parking: require('./parking')(sequelize),
  ParkingRecord: require('./parkingRecord')(sequelize),
  Vehicle: require('./vehicle')(sequelize)
};

// Define associations
Object.values(models).forEach(model => {
  if (model.associate) {
    model.associate(models);
  }
});

// Initialize database
const initializeDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    await sequelize.sync({ alter: true });
    console.log('Database synchronized.');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
};

// Export sequelize instance and models
module.exports = {
  sequelize,
  models,
  initializeDatabase
};
