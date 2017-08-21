/**
 * Created by ldu32 on 19/08/17.
 */
const db = require('../../config/db.js');

exports.getAllProjects = function(start, count, done){
    const getAllProjects = 'SELECT `project_data`.`project_id`, `project_data`.`title`, `project_data`.`subtitle`, ' +
        '`project_data`.`image_uri` FROM `mysql`.`project_data` LIMIT ?,?;';
    let values = [start, start+count];
    db.get().query(getAllProjects, values, function(err, rows) {
        console.log({"err":err});
        console.log({"rows":rows});
        if(err) return done({"ERROR":"Error selecting"});
        return done(null, rows);
    })
};

exports.getCreatorName = function(project_id, done){
    const selectCreatorName = 'SELECT `creator`.`creator_id`, `public_user`.`username` FROM `mysql`.`creator` ' +
        'JOIN `public_user`.`username` ON `public_user`.`id` = `creator`.`creator_id` WHERE `creator`.`project_id` = ?';
    db.get().query(selectCreatorName, project_id, function(err, rows) {
        if(err) return done({"ERROR":"Error selecting"});
        return done(rows);
    })
};

exports.getOneProjectData = function (project_id, done) {
    const selectOneProjectData = 'SELECT `project_data`.`title`, `project_data`.`subtitle`, `project_data`.`description`, ' +
        '`project_data`.`image_uri`, `project_data`.`target` FROM `mysql`.`project_data` ' +
        'WHERE `project_data`.`project_id` = ?';
    db.get().query(selectOneProjectData, project_id, function(err, rows) {
        if(err) return done({"ERROR":"Error selecting"});
        return done(null, rows);
    })
};

exports.getRewardsPerProject = function (project_id, done) {
    const selectRewardsByID = 'SELECT `reward`.`reward_id`, `reward`.`amount`, `reward`.`description`, ' +
        'FROM `mysql`.`reward` WHERE `reward`.`project_id` = ?';
    db.get().query(selectRewardsByID, project_id, function(err, rows) {
        if(err) return done({"ERROR":"Error selecting"});
        return done(rows);
    })
};

exports.getProjectDetail = function (project_id, done) {
    const selectProjectDetail = 'SELECT `project`.`creation_date` FROM `mysql`.`project` ' +
        'WHERE  `project`.`project_id` =?';
    db.get().query(selectProjectDetail, project_id, function(err, rows) {
        if(err) return done({"ERROR":"Error selecting"});
        return done(rows);
    })
};

exports.getProgress = function (project_id, done) {
    const selectProgress = 'SELECT `progress`.`target`, `progress`.`current_Pledged`, `progress`.`number_Of_Backers` ' +
        'FROM `mysql`.`progress` WHERE `progress`.`project_id` = ?';
    db.get().query(selectProgress, project_id, function (err, rows) {
        if(err) return done({"ERROR":"Error selecting"});
        return done(rows);
    })
};

exports.getBacker = function (project_id, done) {
    const selectBacker = 'SELECT `public_user`.`username`, `pledge`.`amount` FROM `mysql`.`pledge` ' +
        'JOIN `public_user`.`username` ON `pledge`.`backer_id` =  `public_user`.`id` ' +
        'WHERE  `pledge`.`project_id` = ? AND `pledge`.`backer_id` = `public_user`.`id` AND `pledge`.`anonymous` = 0';
    db.get().query(selectBacker, project_id, function (err, rows) {
        if(err) return done({"ERROR":"Error selecting"});
        return done(rows);
    })
};

exports.getImage = function (project_id, done) {
    const selectImageuri = 'SELECT `project_data`.`image_uri` FROM `mysql`.`project_data` ' +
        'WHERE `project_data`.`project_id` = ?';
    db.get().query(selectImageuri, project_id, function (err, rows) {
        if(err) return done({"ERROR":"Error selecting"});
        return done(rows);
    })
};

exports.postImage = function (project_id, image_uri, done) {
    const insertImage = 'UPDATE `mysql`.`project_data` SET `image_uri` = ? WHERE `project_id` = ?';
    let values = [image_uri, project_id];
    db.get().query(insertImage, values, function (err, result) {
        if (err) return done(err);
        done(result);
    });
};

exports.alterClose = function (project_id, open_status, done) {
    let open_target = 0;
    if (open_status === 0) {
        open_target = 1;
    } else {
        open_target = 0;
    }
    let values = [open_target, project_id];
    const alterProjectOpen = 'UPDATE `mysql`.`project` SET `open` = ? WHERE `project_id` = ?;';
    db.get().query(alterProjectOpen, values, function (err, result) {
        if (err) return done(err);
        done(result);
    });
};

exports.postPledge = function (amount, anonymous, project_id, backer_id, done) {
    const insertPledge = 'INSERT INTO `mysql`.`pledge` (`amount`,`anonymous`, `project_id`, `backer_id`) ' +
            'VALUES (?, ?, ?, ?);';
    let values = [amount, anonymous, project_id, backer_id];
    db.get().query(insertPledge, values, function (err, result) {
        if (err) return done(err);
        done(result);
    });
};

exports.updateProgress = function (project_id, done) {
    const updateProgress = 'UPDATE `mysql`.`progress` SET `progress`.`current_pledged` = ' +
        '(SELECT SUM(`pledge`.`amount`) FROM `mysql`.`pledge` WHERE `pledge`.`project_id` = ?), ' +
        '`number_of_backers` = (SELECT DISTINCT COUNT(`backer`.``backer_id) FROM `mysql`.`backer` ' +
        'WHERE `backer`.`project_id` = ?) WHERE `project_id` = ?';

    let values = [project_id,project_id,project_id];
    db.get().query(updateProgress, values, function (err, result) {
        if (err) return done(err);
        done(result);
    })

};

exports.postProject = function (done) {
    const insertProject = 'INSERT INTO project VALUE();';
    const returnRecentID = 'SELECT LAST_INSERT_ID();';
    db.get().query(insertProject, function (err, next) {
        if (err) return done(err);
        next()
    });
    db.get().query(returnRecentID, function (err, result) {
        if (err) return done(err);
        done(result);
    });
};

exports.postProjectData = function (project_id, title, subtitle, description, imageUri, target, done) {
    const insertProjectData = 'INSERT INTO `mysql`.`project_data` (`title`, `subtitle`, `description`, `image_uri`,' +
        '`target`) VALUES (?, ?, ?, ?, ?) WHERE `project_id` =?';
    let values = [title, subtitle, description, imageUri, target, project_id];
    db.get().query(insertProjectData, values, function (err, result) {
        if (err) return done(err);
        done(result);
    });
};

exports.postReward = function (amount, description, project_id, done){
    const insertReward = 'INSERT INTO `mysql`.`reward` (`amount`, `description`, `project_id`) VALUES (?,?,?)';
    let values = [amount, description,project_id];
    db.get().query(insertReward, values, function (err, result) {
        if (err) return done(err);
        done(result);
    });
};

exports.postCreator = function (project_id, creator_id, done) {
    const insertReward = 'INSERT INTO `mysql`.`creator` VALUES (?,?)';
    let values = [project_id, creator_id];
    db.get().query(insertReward, values, function (err, result) {
        if (err) return done(err);
        done(result);
    });
};

exports.getProjectCreator = function (project_id, done) {
    const selectCreator = 'SELECT `creator`.`creator_id` FROM `mysql`.`creator` WHERE `creator`.`project_id` = ?;';
    db.get().query(selectCreator, project_id, function (err, result) {
        if (err) return done(err);
        done(result);
    });
};

exports.getBackID = function (project_id, done) {
    const selectBackID = 'SELECT `backer`.`backer_id` FROM `mysql`.`backer` WHERE `backer`.`project_id` = ?;';
    db.get().query(selectBackID, project_id, function (err, result) {
        if (err) return done(err);
        done(result);
    });
};

exports.getCurrentCreated = function (user_id, done) {
    const countCurrentCreated = 'SELECT 1 FROM `mysql`.`creator` ' +
        'WHERE `creator`.`creator_id` = ?';
    db.get().query(countCurrentCreated, user_id, function (err, result) {
        if (err) return done(err);
        done(result);
    })
};

exports.getCurrentIDDetail = function (user_id, done) {
    const checkCurrentID = 'SELECT 1 FROM `mysql`.`Users` WHERE `Users`.`id` = ?';
    db.get().query(checkCurrentID, user_id, function (err, result) {
        if (err) return done(err);
        done(result);
    })
};

exports.deleteUserOnly = function (user_id, done) {
    const deleteUserOnly = 'DELETE FROM `mysql`.`Users` WHERE `Users`.`id` = ?;'
    db.get().query(deleteUserOnly, user_id, function (err, result) {
        if (err) return done(err);
        done(result);
    })
};

exports.updateOpenStatus = function (user_id, done) {
    const updateOpen = 'UPDATE `mysql.`project` p JOIN `mysql.`creator` c SET p.`open` = 0 ' +
        'WHERE c.`creator_id` = ?';
    db.get().query(updateOpen, user_id, function (err, result) {
        if (err) return done(err);
        done(result);
    })
};
