const dotenv = require('dotenv');
dotenv.config();
var Pool = require('pg-pool');
const winston = require('winston');
const {
   format
} = require('winston');


module.exports = {
   pool: new Pool({
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT
   }),



   //logger
   loggers: {
      info: winston.createLogger({
         level: 'info',
         format: format.combine(
            format.timestamp({
               format: "YYYY-MM-DD HH:mm:ss"
            }),
            format.simple()
         ),
         transports: [new winston.transports.File({
            filename: "info.log"
         })],
      }),

      error: winston.createLogger({
         level: 'error',
         format: format.combine(
            format.timestamp({
               format: "YYYY-MM-DD HH:mm:ss"
            }),
            format.simple()
         ),
         transports: [new winston.transports.File({
            filename: "error.log"
         }), ],
      })
   },



}