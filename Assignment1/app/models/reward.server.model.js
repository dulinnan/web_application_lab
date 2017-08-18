/**
 * Created by ldu32 on 18/08/17.
 */
const db = require('../../config/db.js');

exports.getAll = function(user_id, done){
    const getRewards = 'SELECT `reward`.`reward_id`, `reward`.`amount`, `reward`.`description` ' +
        'FROM `seng_365`.`reward` WHERE `reward`.`project_id` = ?';
    db.get().query(getRewards, [user_id], function(err, rows) {
        if(err) return done({"ERROR":"Error selecting"});
        return done(rows);
    })
};

exports.alter = function(user_id, pledge_amount, description, project_id, done){
    const putRewards = 'UPDATE `seng_365`.`reward` SET `amount` = ?, `description` = ?,' +
        '`project_id` = ? WHERE `reward_id` = ?;';
    let values = [pledge_amount, description, project_id, user_id];
    db.get().query(putRewards, values, function (err, result) {
        if (err) return done(err);
        done(result);
    });
};