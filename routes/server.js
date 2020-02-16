var express = require('express');
import { connection, pool } from '../connection';
import { logInfo, isEmpty } from '../method/utils';
var router = express.Router();
var moment = require('moment');
var async = require('async');

/**
 * 获取全部可预约状态的时间段、可预约数量
 */
router.get('/getAppoint', async (req, res) => {
    logInfo({ 'app': 'appointDemo', 'api': 'getAppoint', 'ip': req.ip, 'param': req.body });
    let sql = `SELECT date_from AS dateFrom, date_to AS dateTo, quantity FROM appoint 
    where date_from BETWEEN date_add(CURDATE(), interval 1 day) 
    AND date_add(CURDATE(), interval 8 day)`;
    async.waterfall(
        [
            async callback => {
                connection(sql, function (err, datasource) {
                    callback(err, datasource)
                })
            },
            async (datasource, callback) => {
                let data = [];
                for (let i=1; i<=7; i++) {
                    let day = moment().add(i, 'days').format("YYYY-MM-DD")
                    for (let j=9; j<=14; j++) {
                        let dateTo = `${day} ${j+1}:00:00`;
                        if (`${j}`.length === 1) {
                            j = `0${j}`
                        }
                        let dateFrom = `${day} ${j}:00:00`;
                        if (datasource.length > 0) {
                            let re = datasource.filter((data) => moment(data.dateFrom).format("YYYY-MM-DD HH:ss:mm") === dateFrom);    
                            if (re.length > 0 && dateFrom === moment(re[0].dateFrom).format("YYYY-MM-DD HH:ss:mm")) {
                                if (re[0].quantity > 0) {
                                    data.push({dateFrom,dateTo,quantity: re[0].quantity});
                                }
                            } else {
                                data.push({dateFrom,dateTo,quantity:6});
                            }
                        } else {
                            data.push({dateFrom,dateTo,quantity:6});
                        }
                    }
                }
                callback(null, data);
            },
        ],
        (err, result) => {
            if (isEmpty(err)) {
                res.json({ status: 200, result })
            } else {
                logInfo({ 'app': 'appointDemo', 'api': 'getAppoint', message: 'error', 'sqlMessage': err.sqlMessage });
                return res.json({ status: 500, message: err.sqlMessage });
            }
        }
    )
});

/**
 * 预约某个时间段的服务
 */
router.post('/addAppoint', async (req, res) => {
    logInfo({ 'app': 'appointDemo', 'api': 'addAppoint', 'ip': req.ip, 'param': req.body });
    let param = req.body;
    let startDay = moment().add(1, 'days').format("YYYY-MM-DD");
    let endDay = moment().add(8, 'days').format("YYYY-MM-DD");
    let h1 = param.dateFrom.slice(11, 12) === '0' ? param.dateFrom.slice(12, 13) : param.dateFrom.slice(11, 13);
    let h2 = param.dateTo.slice(11, 12) === '0' ? param.dateTo.slice(12, 13) : param.dateTo.slice(11, 13);
    if (parseInt(h2) - parseInt(h1) !== 1) {
        return res.json({ status: 500, message: "该时间段有误！" })
    }
    if (moment(param.dateFrom).isBefore(startDay) || moment(param.dateTo).isAfter(endDay)
        || parseInt(h1) < 9 || parseInt(h1) > 14 || parseInt(h2) > 15 || parseInt(h2) < 10) {
        return res.json({ status: 500, message: "该时间段不可预约！" })
    }
    let sql = `SELECT id, date_from, date_to, quantity FROM appoint WHERE date_from=? AND date_to=?;`;
    let sqlParam = [param.dateFrom, param.dateTo];
    let sql1 = `INSERT INTO appoint (date_from, date_to, quantity, created_by, created_at, updated_by, updated_at) 
    VALUES (?,?,?,?,NOW(),?,NOW());`;
    let sqlParam1 = [param.dateFrom, param.dateTo, 5, 1, 1];
    let sql2 = `INSERT INTO customer_appointment (name, phone, date_from, date_to, status, created_by, created_at, updated_by, updated_at) 
    VALUES (?,?,?,?,?,?,NOW(),?,NOW());`;
    let sqlParam2 = [param.name, param.phone, param.dateFrom, param.dateTo, 'active', 1, 1];
    await pool.getConnection(async (err, conn) => {
        await conn.beginTransaction();
        async.waterfall(
            [
                async callback => {
                    conn.query(sql, sqlParam, function (err, datasource) {
                        callback(err, datasource)
                    })
                },
                async (datasource, callback) => {
                    if (datasource.length > 0) {
                        if (datasource[0].quantity === 0) {
                            //非预约状态下，访问链接不可用，不存在（个人认为不建议用40x状态码，4xx一般为客户端请求错误，而这是正常的请求，应该返回200或者500，给客户一个提示就可）
                            callback({resStatus: 409, sqlMessage: '该时间段已约满！'}, datasource)
                        } else {
                            sql1 = `UPDATE appoint SET updated_by = ?,quantity = quantity-1 WHERE date_from=? AND date_to=?;`;
                            sqlParam1 = [1, param.dateFrom, param.dateTo];
                            conn.query(sql1, sqlParam1, function (err1, result1) {
                                callback(err1, result1)
                            })
                        }
                    } else {
                        conn.query(sql1, sqlParam1, function (err1, result1) {
                            callback(err1, result1)
                        })
                    }
                },
                async (result1, callback) => {
                    conn.query(sql2, sqlParam2, function (err2, result2) {
                        callback(err2, result2)
                    })
                },
            ],
            (err, result) => {
                if (isEmpty(err)) {
                    conn.commit();
                    conn.release();
                    res.json({ status: 200 })
                } else {
                    logInfo({ 'app': 'appointDemo', 'api': 'addAppoint', message: 'error', 'sqlMessage': err.sqlMessage });
                    conn.rollback();
                    conn.release();
                    if (!isEmpty(err.resStatus)) {
                        res.status(409);
                    } 
                    res.json({ status: isEmpty(err.resStatus) ? 500 : err.resStatus, message: err.sqlMessage });
                }
            }
        )
    });
});

module.exports = router;