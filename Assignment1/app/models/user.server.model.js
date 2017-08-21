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

exports.insert = function(password, username, location, email, done){
    let insertId = 0;
    const insertUser = 'INSERT INTO `seng_365`.`user` (`password`) VALUES (?);';
    let values1 = [password];
    const returnRecentID = 'SELECT LAST_INSERT_ID();';

    db.get().query(insertUser, values1, function (err, next) {
        if (err) return done(err);
        next()
    });

    db.get().query(returnRecentID, function (err, result, next) {
        if (err) return done(err);
        insertId = result;
        next()
    });

    const insetPublicUser = 'INSERT INTO `seng_365`.`public_user` (`id`, `username`, `location`,`email`) ' +
        'VALUES (?,?,?,?)';
    let values2 = [insertId, username, location, email];

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

exports.checkIfIDExists = function (user_id, done) {
    const selectUserID = 'SELECT 1 ` FROM `seng 365`.`user` WHERE `user`.`id = ?';
    db.get().query(selectUserID, user_id, function (err, result) {
        if (err) return done(err);
        done(result);
    });
};

exports.checkIfUsernameDuplicate = function (username, done) {
    const selectUserUsername = 'SELECT 1 ` FROM `seng 365`.`public_user` WHERE `public_user`.`username = ?';
    db.get().query(selectUserUsername, username, function (err, result) {
        if (err) return done(err);
        done(result);
    });
};