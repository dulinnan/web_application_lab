/**
 * Created by ldu32 on 16/08/17.
 */
const mysql = require('mysql');
const state = { pool: null
};

exports.connect = function(done) { state.pool = mysql.createPool({
    host: process.env.SENG365_MYSQL_HOST || 'localhost',
    port: process.env.SENG365_MYSQL_PORT || 6033,
    user: 'root',
    password: "secret",
    database: "mysql", //NOTE: we need to create this first
    multipleStatements: true
});
    done();
};

exports.get = function() {
    return state.pool;
};