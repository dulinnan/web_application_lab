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

exports.insertUsers = function (password, done) {
    const insertUser = 'INSERT INTO `mysql`.`Users` (`password`) VALUES (?);';
    db.get().query(insertUser, password, function (err, result) {
        if (err) return done(err);
        return done(null, result);
    });
};


exports.insert = function(project_id, username, location, email, done){
    const insetPublicUser = 'INSERT INTO `mysql`.`public_user` (`id`, `username`, `location`,`email`) ' +
        'VALUES (?,?,?,?)';
    let values2 = [project_id, username, location, email];

    db.get().query(insetPublicUser, values2, function (err, result) {
        if (err) return done(err);
        return done(null, result);
    });
};

exports.alter = function(user_id, user_name, location, email, done){
    const updateUser = 'UPDATE `mysql`.`public_user` SET `username` = ?, `location` = ?, `email` = ? ' +
        'WHERE `id` = ?;';
    let values = [username, location, email, user_id];
    db.get().query(updateUser, values, function (err, result) {
        if (err) return done(err);
        done(null, result);
    });
};

exports.remove = function(user_id, done){
    const removeUser = 'DELETE FROM `mysql`.`Users` WHERE `id` = ?;';
    db.get().query(removeUser, user_id, function (err, result) {
        if (err) return done(err);
        done(null, result);
    });
};

exports.insertToken = function (user_id, token, done) {
    const insertToken = 'INSERT INTO `mysql`.`login_response` (login_id, token) VALUES (?, ?);';
    let values = [user_id, token];
    db.get().query(insertToken, values, function (err, result) {
        if (err) return done(err);
        done(null, result);
    });
};

exports.requestToken = function (user_id, done) {
    const reqToken = 'SELECT `token` FROM `mysql`.`login_response` WHERE `login_response`.`login_id` = ?;';
    db.get().query(reqToken, user_id, function (err, result) {
        if (err) return done(err);
        done(null, result);
    });
};

exports.login = function (user_id, done) {
    const updateLoginStatus = 'UPDATE `mysql`.`login_response` SET `loginBoolean` = 1 WHERE `login_id`=?';
    db.get().query(updateLoginStatus, user_id, function (err, result) {
        if (err) return done(err);
        done(null, result);
    });
};

exports.logout = function (user_id, done) {
    const deleteToken = 'UPDATE `mysql`.`login_response` SET `loginBoolean` = 0 WHERE `login_id`=?;';
    db.get().query(deleteToken, user_id, function (err, result) {
        if (err) return done(err);
        done(null, result);
    });
};

exports.checkIfIDExists = function (user_id, done) {
    const selectUserID = 'SELECT * ` FROM `mysql`.`Users` WHERE `Users`.`id = ?';
    db.get().query(selectUserID, user_id, function (err, result) {
        if (err) return done(err);
        done(null, result);
    });
};

exports.checkIfUsernameDuplicate = function (username, done) {
    const selectUserUsername = 'SELECT id FROM `mysql`.`public_user` WHERE `public_user`.`username` = ?';
    db.get().query(selectUserUsername, username, function (err, result) {
        if (err) return done(err);
        done(null, result);
    });
};

exports.checkIfAlreadyLogout = function (user_id, done) {
    const selectLogBoolean = 'SELECT `loginBoolean` FROM `mysql`.`login_response` WHERE `login_id`=?';
    db.get().query(selectLogBoolean, user_id, function (err, result) {
        if (err) return done(err);
        done(null, result);
    });
};