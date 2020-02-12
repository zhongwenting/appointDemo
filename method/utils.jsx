var momenttz = require('moment-timezone');
import logger from '../log';

export const isEmpty = function (value) {
    if (typeof value === "undefined" || value === '' || value == null) {
        return true;
    } else {
        return false;
    }
}

export const logInfo = function (param) {
    if (!param) {
        param = {};
    }
    param['date'] = momenttz.tz(Date.now(), 'Asia/Shanghai').format();
    logger.info(param);
}