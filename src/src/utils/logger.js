const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf, colorize } = format;


const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level}]: ${message}`;
});


const logger = createLogger({
  level: 'info', 
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), 
    logFormat 
  ),
  transports: [
    new transports.Console(), // Log to console
    new transports.File({ filename: 'logs/app.log' }) 
  ],
});


module.exports = logger;
