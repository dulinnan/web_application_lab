/**
 * Created by ldu32 on 18/08/17.
 */
const express = require('express');
const db = require('./db');
const mysql = require('mysql');

exports.createUser = function(){
    const userTable = 'CREATE TABLE IF NOT EXISTS `Users` (`id` int(11) NOT NULL AUTO_INCREMENT, `password` varchar(45) DEFAULT NULL, ' +
        'PRIMARY KEY (`id`));';

    db.get().query(userTable,function (err, rows){
            if (err) console.log(err);
        }
    )
};

exports.createPublicUser = function() {
    const publicUserTable = 'CREATE TABLE IF NOT EXISTS `public_user` (`id` int(11) NOT NULL,`username` varchar(45) DEFAULT NULL,' +
        '`location` varchar(45) DEFAULT NULL,`email` varchar(45) DEFAULT NULL,' +
        'PRIMARY KEY (`id`),CONSTRAINT `user_id_ref_public` FOREIGN KEY (`id`) ' +
        'REFERENCES `Users` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION) ' +
        'ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT="basic info about Users";';

    db.get().query(publicUserTable, function (err, rows) {
            if (err) console.log(err);
        }
    )
};

exports.createProject = function () {
    const projectTable = 'CREATE TABLE IF NOT EXISTS  `project` (`project_id` int(11) NOT NULL AUTO_INCREMENT,' +
        ' `creation_date` datetime DEFAULT CURRENT_TIMESTAMP,`open` tinyint(4) NOT NULL DEFAULT 1, ' +
    'PRIMARY KEY (`project_id`)) ';
    db.get().query(projectTable, function (err, rows) {
            if (err) console.log(err);
        }
    )
};

exports.createProjectData = function () {
    const projectDataTable = 'CREATE TABLE IF NOT EXISTS `project_data` (`project_id` int(11) NOT NULL,`title` varchar(45) NOT NULL,' +
        '`subtitle` varchar(45) NOT NULL,`description` varchar(45) NOT NULL,`image_uri` varchar(45) DEFAULT NULL,' +
        '`target` int(11) NOT NULL,PRIMARY KEY (`project_id`),CONSTRAINT `project_id_ref_data` ' +
        'FOREIGN KEY (`project_id`) REFERENCES `project` (`project_id`) ON DELETE CASCADE ON UPDATE NO ACTION) ' +
        'ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT="detailed info of project";';
    db.get().query(projectDataTable, function (err, rows) {
            if (err) console.log(err);
        }
    )
};

exports.createRewardTale = function () {
    const rewardTable = 'CREATE TABLE IF NOT EXISTS `reward` (`reward_id` int(11) NOT NULL AUTO_INCREMENT, ' +
        '`amount` varchar(45) DEFAULT NULL, `description` varchar(45) DEFAULT NULL, `project_id` int(11) NOT NULL, ' +
        'PRIMARY KEY (`reward_id`), KEY `project_id_ref_reward_idx` (`project_id`), ' +
        'CONSTRAINT `project_id_ref_reward` FOREIGN KEY (`project_id`) ' +
        'REFERENCES `project` (`project_id`) ON DELETE CASCADE ON UPDATE NO ACTION) ' +
        'ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT="a project reward"';
    db.get().query(rewardTable, function (err, rows) {
            if (err) console.log(err);
        }
    )
};

exports.createPledgeTable = function () {
    const pledgeTable = 'CREATE TABLE IF NOT EXISTS `pledge` (`pledge_id` int(11) NOT NULL AUTO_INCREMENT,`amount` int(11) NOT NULL,' +
        '`anonymous` tinyint(4) DEFAULT NULL,`project_id` int(11) NOT NULL,`backer_id` int(11) NOT NULL,' +
        'PRIMARY KEY (`pledge_id`),KEY `project_id_ref_pledge_idx` (`project_id`),' +
        'KEY `backer_id_ref_pledge_idx` (`backer_id`),' +
        'CONSTRAINT `backer_id_ref_pledge` FOREIGN KEY (`backer_id`) ' +
        'REFERENCES `Users` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,' +
        'CONSTRAINT `project_id_ref_pledge` FOREIGN KEY (`project_id`) ' +
        'REFERENCES `project` (`project_id`) ON DELETE CASCADE ON UPDATE NO ACTION) ' +
        'ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT="money from backer, single time single count";';
    db.get().query(pledgeTable, function (err, rows) {
            if (err) console.log(err);
        }
    )
};

exports.createProgress = function () {
    const progressTable = 'CREATE TABLE IF NOT EXISTS `progress` (`current_pledged` varchar(45) DEFAULT NULL,' +
        '`number_of_backers` varchar(45) DEFAULT NULL,' +
        '`project_id` int(11) NOT NULL,PRIMARY KEY (`project_id`),' +
        'CONSTRAINT `project_id_progress` FOREIGN KEY (`project_id`) ' +
        'REFERENCES `project` (`project_id`) ON DELETE CASCADE ON UPDATE NO ACTION) ' +
        'ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT="progress of funding";';
    db.get().query(progressTable, function (err, rows) {
            if (err) console.log(err);
        }
    )
};

exports.createBackerTable = function () {
    const backerTable = 'CREATE TABLE IF NOT EXISTS `backer` (`project_id` int(11) DEFAULT NULL,' +
        '`backer_id` int(11) DEFAULT NULL,KEY `project_id_backer_idx` (`project_id`),' +
        'KEY `backer_id_ref_idx` (`backer_id`),' +
        'CONSTRAINT `backer_id_ref` FOREIGN KEY (`backer_id`) ' +
        'REFERENCES `Users` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,' +
        'CONSTRAINT `project_id_backer` FOREIGN KEY (`project_id`) ' +
        'REFERENCES `project` (`project_id`) ON DELETE CASCADE ON UPDATE NO ACTION) ' +
        'ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT="link supporter to the project";';
    db.get().query(backerTable, function (err, rows) {
            if (err) console.log(err);
        }
    )
};

exports.createCreatorTable = function () {
    const creatorTable = 'CREATE TABLE IF NOT EXISTS `creator` (`project_id` int(11) DEFAULT NULL,' +
        '`creator_id` int(11) DEFAULT NULL,KEY `id_idx` (`project_id`),KEY `id_idx1` (`creator_id`),' +
        'CONSTRAINT `project_id_ref` FOREIGN KEY (`project_id`) ' +
        'REFERENCES `project` (`project_id`) ON DELETE CASCADE ON UPDATE NO ACTION,' +
        'CONSTRAINT `user_id_ref` FOREIGN KEY (`creator_id`) ' +
        'REFERENCES `Users` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION) ' +
        'ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT="link creator and projects";';
    db.get().query(creatorTable, function (err, rows) {
            if (err) console.log(err);
        }
    )
};

exports.createLoginResponse = function () {
    const loginResponseTable = 'CREATE TABLE IF NOT EXISTS `login_response` (`login_id` int(11) NOT NULL,' +
        '`token` varchar(45) DEFAULT NULL,PRIMARY KEY (`login_id`),' +
        'CONSTRAINT `user_id_ref_login` FOREIGN KEY (`login_id`) ' +
        'REFERENCES `Users` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION) ' +
        'ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT="each token assign to an user id";';
    db.get().query(loginResponseTable, function (err, rows) {
            if (err) console.log(err);
        }
    )
};

