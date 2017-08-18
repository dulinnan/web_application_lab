/**
 * Created by ldu32 on 16/08/17.
 */
const db = require('../../config/db.js');

exports.getAll = function(done){
    db.get().query('SELECT * FROM Users', function(err, rows) {
        if(err) return done({"ERROR":"Error selecting"});
        return done(rows);
    })
};

exports.getOne = function(){
    return null;
};

exports.insert = function(username, done){
    let values = [username];

    db.get().query('INSERT INTO Users (username) VALUES ?', values, function (err, result) {
        if (err) return done(err)

        done(result);
    });
};

exports.alter = function(){
    return null;
};

exports.remove = function(){
    return null;
};