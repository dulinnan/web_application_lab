/**
 * Created by ldu32 on 16/08/17.
 */
const mysql = require('mysql');
// const dbBuild = require('./dbBuild');
const state = { pool: null
};

exports.connect = function(done) { state.pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: "secret",
    port: '6033',
    database: "chatapp" //NOTE: we need to create this first
});
    // exports.createUser = function(){
    //
    //         }
    //     )
    // };
    const userTable = 'CREATE TABLE IF NOT EXISTS `user` (`id` int(11) NOT NULL, `password` varchar(45) DEFAULT NULL, ' +
        'PRIMARY KEY (`id`) ENGINE=InnoDB DEFAULT CHARSET=utf8 ' +
        'COMMENT="user info and password";';

    state.pool.query("CREATE TABLE IF NOT EXISTS `user` (`id` int(11) NOT NULL, `password` varchar(45) DEFAULT NULL, ' + 'PRIMARY KEY (`id`)",function (err, rows){
        if (err) return err;
        return rows;
    });
    done();
};

exports.get = function() {
    return state.pool;
}