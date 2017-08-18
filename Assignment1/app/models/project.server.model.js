/**
 * Created by ldu32 on 19/08/17.
 */
const db = require('../../config/db.js');

exports.getAllProjects = function(done){
    const getAllProjects = 'SELECT `project_data`.`project_id`, `project_data`.`title`, `project_data`.`subtitle`, ' +
        '`project_data`.`image_uri` FROM `seng_365`.`project_data`;';
    db.get().query(getAllProjects, function(err, rows) {
        if(err) return done({"ERROR":"Error selecting"});
        return done(rows);
    })
};

exports.getCreatorName = function(project_id, done){
    const selectCreatorName = 'SELECT `creator`.`creator_id`, `public_user`.`username` FROM `seng_365`.`creator` ' +
        'JOIN `public_user`.`username` ON `public_user`.`id` = `creator`.`creator_id` WHERE `creator`.`project_id` = ?';
    db.get().query(selectCreatorName, project_id, function(err, rows) {
        if(err) return done({"ERROR":"Error selecting"});
        return done(rows);
    })
};

exports.getOneProjectData = function (project_id, done) {
    const selectOneProjectData = 'SELECT `project_data`.`title`, `project_data`.`subtitle`, `project_data`.`description`, ' +
        '`project_data`.`image_uri`, `project_data`.`target` FROM `seng_365`.`project_data` ' +
        'WHERE `project_data`.`project_id` = ?';
    db.get().query(selectOneProjectData, project_id, function(err, rows) {
        if(err) return done({"ERROR":"Error selecting"});
        return done(rows);
    })
};

exports.getRewardsPerProject = function (project_id, done) {
    const selectRewardsByID = 'SELECT `reward`.`reward_id`, `reward`.`amount`, `reward`.`description`, ' +
        'FROM `seng_365`.`reward` WHERE `reward`.`project_id` = ?';
    db.get().query(selectRewardsByID, project_id, function(err, rows) {
        if(err) return done({"ERROR":"Error selecting"});
        return done(rows);
    })
};

exports.getProjectDetail = function (project_id, done) {
    const selectProjectDetail = 'SELECT `project`.`creation_date` FROM `seng_365`.`project` ' +
        'WHERE  `project`.`project_id` =?';
    db.get().query(selectProjectDetail, project_id, function(err, rows) {
        if(err) return done({"ERROR":"Error selecting"});
        return done(rows);
    })
};

exports.getProgress = function (project_id, done) {
    const selectProgress = 'SELECT `progress`.`target`, `progress`.`current_Pledged`, `progress`.`number_Of_Backers` ' +
        'FROM `seng_365`.`progress` WHERE `progress`.`project_id` = ?';
    db.get().query(selectProgress, project_id, function (err, rows) {
        if(err) return done({"ERROR":"Error selecting"});
        return done(rows);
    })
};

exports.getBacker = function (project_id, done) {
    const selectBacker = 'SELECT `public_user`.`username`, `pledge`.`amount` FROM `seng_365`.`pledge` ' +
        'JOIN `public_user`.`username` ON `pledge`.`backer_id` =  `public_user`.`id` ' +
        'WHERE  `pledge`.`project_id` = ? AND `pledge`.`backer_id` = `public_user`.`id` AND `pledge`.`anonymous` = 0';
    db.get().query(selectBacker, project_id, function (err, rows) {
        if(err) return done({"ERROR":"Error selecting"});
        return done(rows);
    })
};

exports.getImage = function (project_id, done) {
    const selectImageuri = 'SELECT `project_data`.`image_uri` FROM `seng_365`.`project_data` ' +
        'WHERE `project_data`.`project_id` = ?';
    db.get().query(selectImageuri, project_id, function (err, rows) {
        if(err) return done({"ERROR":"Error selecting"});
        return done(rows);
    })
};

exports.postImage = function (project_id, image_uri, done) {
    const insertImage = 'UPDATE `seng_365`.`project_data` SET `image_uri` = ? WHERE `project_id` = ?';
    let values = [image_uri, project_id];
    db.get().query(insertImage, values, function (err, result) {
        if (err) return done(err);
        done(result);
    });
};

exports.alterClose = function (project_id, done) {
    const alterProjectOpen = 'UPDATE `seng_365`.`project` SET `open` = 0 WHERE `project_id` = ?;';
    db.get().query(alterProjectOpen, project_id, function (err, result) {
        if (err) return done(err);
        done(result);
    });
};

exports.postPledge = function (amount, anonymous, project_id, backer_id, done) {
    const insertPledge = 'INSERT INTO `seng_365`.`pledge` (`amount`,`anonymous`, `project_id`, `backer_id`) ' +
            'VALUES (?, ?, ?, ?);';
    let values = [amount, anonymous, project_id, backer_id];
    db.get().query(insertPledge, values, function (err, result) {
        if (err) return done(err);
        done(result);
    });
};

exports.postProjectData = function (project_id, title, subtitle, description, imageUri, target, done) {
    const insertProjectData = 'INSERT INTO `seng_365`.`project_data` (`title`, `subtitle`, `description`, `image_uri`,' +
        '`target`) VALUES (?, ?, ?, ?, ?) WHERE `project_id` =?';
    let values = [title, subtitle, description, imageUri, target, project_id];
    db.get().query(insertProjectData, values, function (err, result) {
        if (err) return done(err);
        done(result);
    });
};

exports.postReward = function (amount, description,project_id, done){
    const insertReward = 'INSERT INTO `seng_365`.`reward` (`amount`, `description`, `project_id`) VALUES (?,?,?)';
    let values = [amount, description,project_id];
    db.get().query(insertReward, values, function (err, result) {
        if (err) return done(err);
        done(result);
    });
};

