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
    const selectUserID = 'SELECT * ` FROM `mysql`.`Users` WHERE `Users`.`id = ?';
    db.get().query(selectUserID, user_id, function (err, result) {
        if (err) return done(err);
        done(null, result);
    });
};

exports.checkIfUsernameDuplicate = function (username, done) {
    const selectUserUsername = 'SELECT * FROM `mysql`.`public_user` WHERE `public_user`.`username` = ?';
    db.get().query(selectUserUsername, [username], function (err, result) {
        if (err) return done(err);
        done(null, result);
    });
};
