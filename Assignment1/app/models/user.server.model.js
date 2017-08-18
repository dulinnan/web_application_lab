/**
 * Created by ldu32 on 16/08/17.
 */
const db = require('../../config/db.js');

exports.getAllUsers = function(user_id, done){
    const selectAllUsers = 'SELECT * FROM `seng_365`.`public_user` WHERE `id` = ?';
    db.get().query(selectAllUsers, user_id, function(err, rows) {
        if(err) return done({"ERROR":"Error selecting"});
        return done(rows);
    })
};

exports.insert = function(user_id, password, username, location, email, done){
    const insertUser = 'INSERT INTO `seng_365`.`user` (`id`,`password`) VALUES (?, ?);';
    let values1 = [user_id, password];

    const insetPublicUser = 'INSERT INTO `seng_365`.`public_user` (`id`, `username`, `location`,`email`) ' +
        'VALUES (?,?,?,?)';
    let values2 = [user_id, username, location, email];

    db.get().query(insertUser, values1, function (err, result) {
        if (err) return done(err);
        done(result);
    });

    db.get().query(insetPublicUser, values2, function (err, result) {
        if (err) return done(err);
        done(result);
    });
};

exports.alter = function(user_id, user_name, location, email, done){
    const updateUser = 'UPDATE `seng_365`.`public_user` SET `username` = ?, `location` = ?, `email` = ? ' +
        'WHERE `id` = ?;';
    let values = [username, location, email, user_id];
    db.get().query(updateUser, values, function (err, result) {
        if (err) return done(err);
        done(result);
    });
};

exports.remove = function(user_id, done){
    const removeUser = 'DELETE FROM `seng_365`.`user` WHERE `id` = ?;';
    db.get().query(removeUser, user_id, function (err, result) {
        if (err) return done(err);
        done(result);
    });
};

exports.insertToken = function (user_id, token, done) {
    const insertToken = 'INSERT INTO `seng_365`.`login_response` VALUES (?, ?);';
    let values = [user_id, token];
    db.get().query(insertToken, values, function (err, result) {
        if (err) return done(err);
        done(result);
    });
};

exports.logout = function (user_id, done) {
    const deleteToken = 'DELETE FROM `seng_365`.`login_response` WHERE `login_id`=?;';
    db.get().query(deleteToken, user_id, function (err, result) {
        if (err) return done(err);
        done(result);
    });
};