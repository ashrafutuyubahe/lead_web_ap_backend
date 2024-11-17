const { Sequelize } = require('sequelize');
const logger = require('../utils/logger');
require('dotenv').config();  


const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
  }
);

async function connectToDatabase() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
   logger.info("The connection to the database is set and all models were synchronized successfully.");
  } catch (error) {
    logger.error("Failed to connect to the database!", error);
  }
}

connectToDatabase();
module.exports = sequelize;

