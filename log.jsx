var winston = require('winston');
var momenttz = require("moment-timezone");

winston.transports.DailyRotateFile = require('winston-daily-rotate-file');

winston.emitErrs = true;
var logger = new winston.Logger({
    transports: [
        new winston.transports.DailyRotateFile({
            level: 'info',
            filename: './logs/all-logs.log',
            handleExceptions: true,
            datePattern: 'yyyy-MM-dd',
            json: true,
            maxsize: 1024*1024*5, //5MB
            maxFiles: 5,
            colorize: false,
            timestamp: function() {
                return momenttz.tz(Date.now(),'Asia/Shanghai').format();
            }
        }),
        new winston.transports.Http({
            level: 'info',
            host: '127.0.0.1',
            port: 58080,
            json: true,
            timestamp: function() {
                return momenttz.tz(Date.now(),'Asia/Shanghai').format();
            }
        }),
        new winston.transports.Console({
            level: 'debug',
            handleExceptions: true,
            json: false,
            colorize: true,
            timestamp: function() { return new Date(); }
        })
    ],
    exitOnError: false
});

module.exports = logger;