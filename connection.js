var mysql = require('mysql');

export const pool = mysql.createPool({
    user: "root",
    password: "pass123",
    host: "localhost",
    port: 3306,
    database: "test"
});

export const connection = function(sql, param, callback) {
    pool.getConnection(function(err, conn){
        if (err) {
            console.log(err)
            callback(err, null, null);
        } else {
            conn.query(sql, param, function(err, results, fields){
                callback(err, results, fields);
            });
            conn.release();
        }
    });
};