/**
 * Created by ldu32 on 16/08/17.
 */
const db = require('../../config/db.js');

exports.getAllUsers = function(user_id, done){
    let selectAllUsers = 'SELECT * FROM `mysql`.`public_user` WHERE `id` = ?';
    db.get().query(selectAllUsers, user_id, function(err, rows) {
        // console.log(err);
        // console.log(rows);
        if(err) return done({"ERROR":"Error selecting"});
        return done(null, rows);
    })
};

exports.insert = function(password, username, location, email, done){
    let insertId = 0;
    const insertUser = 'INSERT INTO `mysql`.`Users` (`password`) VALUES (?);';
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

    const insetPublicUser = 'INSERT INTO `mysql`.`public_user` (`id`, `username`, `location`,`email`) ' +
        'VALUES (?,?,?,?)';
    let values2 = [insertId, username, location, email];

    db.get().query(insetPublicUser, values2, function (err, result) {
        if (err) return done(err);
        done(result);
    });
};

exports.alter = function(user_id, user_name, location, email, done){
    const updateUser = 'UPDATE `mysql`.`public_user` SET `username` = ?, `location` = ?, `email` = ? ' +
        'WHERE `id` = ?;';
    let values = [username, location, email, user_id];
    db.get().query(updateUser, values, function (err, result) {
        if (err) return done(err);
        done(result);
    });
};

exports.remove = function(user_id, done){
    const removeUser = 'DELETE FROM `mysql`.`Users` WHERE `id` = ?;';
    db.get().query(removeUser, user_id, function (err, result) {
        if (err) return done(err);
        done(result);
    });
};

exports.insertToken = function (user_id, token, done) {
    const insertToken = 'INSERT INTO `mysql`.`login_response` VALUES (?, ?);';
    let values = [user_id, token];
    db.get().query(insertToken, values, function (err, result) {
        if (err) return done(err);
        done(result);
    });
};

exports.logout = function (user_id, done) {
    const deleteToken = 'DELETE FROM `mysql`.`login_response` WHERE `login_id`=?;';
    db.get().query(deleteToken, user_id, function (err, result) {
        if (err) return done(err);
        done(result);
    });
};

exports.checkIfIDExists = function (user_id, done) {
    const selectUserID = 'SELECT 1 ` FROM `mysql`.`Users` WHERE `Users`.`id = ?';
    db.get().query(selectUserID, user_id, function (err, result) {
        if (err) return done(err);
        done(result);
    });
};

exports.checkIfUsernameDuplicate = function (username, done) {
    const selectUserUsername = 'SELECT 1 ` FROM `mysql`.`public_user` WHERE `public_user`.`username = ?';
    db.get().query(selectUserUsername, username, function (err, result) {
        if (err) return done(err);
        done(result);
    });
};
