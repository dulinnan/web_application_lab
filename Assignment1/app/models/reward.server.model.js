/**
 * Created by ldu32 on 18/08/17.
 */
const db = require('../../config/db.js');

exports.getAll = function(user_id, done){
    const getRewards = 'SELECT `reward`.`reward_id`, `reward`.`amount`, `reward`.`description` ' +
        'FROM `mysql`.`reward` WHERE `reward`.`project_id` = ?';
    db.get().query(getRewards, user_id, function(err, rows) {
        if(err) return done({"ERROR":"Error selecting"});
        return done(null, rows);
    })
};

exports.alter = function(user_id, pledge_amount, description, project_id, done){
    const putRewards = 'UPDATE `mysql`.`reward` SET `amount` = ?, `description` = ?,' +
        '`project_id` = ? WHERE `reward_id` = ?;';
    let values = [pledge_amount, description, project_id, user_id];
    db.get().query(putRewards, values, function (err, result) {
        if (err) return done(err);
        done(null, result);
    });
};

exports.getProjectPerBacker = function (user_id, project_id, done) {
    const selectProjectByUserif = 'SELECT * FROM `mysql`.`creator` ' +
        'WHERE `creator`.`creator_id` = ? AND `creator`.`project_id` = ?';
    db.get().query(selectProjectByUserif, user_id, project_id, function (err, result) {
        if (err) return done(err);
        done(null, result);
    });
};

exports.checkIfIDExists = function (user_id, done) {
    const selectUserID = 'SELECT 1 ` FROM `mysql`.`Users` WHERE `Users`.`id = ?';
    db.get().query(selectUserID, user_id, function (err, result) {
        if (err) return done(err);
        done(null, result);
    });
};
