const { Sequelize } = require('sequelize');
const logger = require('../utils/logger');
require('dotenv').config();


const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',  
  dialectOptions: {
    ssl: {
      require: true,      
      rejectUnauthorized: false,  
    },
  },
});


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
