/**
 * Created by ldu32 on 16/08/17.
 */
const mysql = require('mysql');

const state = { pool: null
};

exports.connect = function(done) { state.pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: "secret",
    port: '6033',
    database: "crowdfunding" //NOTE: we need to create this first
});
    done();
};

exports.get = function() {
    return state.pool;
};
