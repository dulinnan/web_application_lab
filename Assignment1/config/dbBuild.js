/**
 * Created by ldu32 on 18/08/17.
 */
const express = require('express');
const db = require('./db');
const mysql = require('mysql');

exports.buildDatabase = function() {
    const mainDatabase = 'CREATE DATABASE IF NOT EXISTS `seng_365`';

    db.get().query('CREATE DATABASE IF NOT EXISTS `seng_365`', function (err, rows){
        if (err) console.log(err);
        }
    )
};

exports.createUser = function(){
    const userTable = 'CREATE TABLE IF NOT EXISTS `user` (`id` int(11) NOT NULL, `password` varchar(45) DEFAULT NULL, ' +
        'PRIMARY KEY (`id`) ENGINE=InnoDB DEFAULT CHARSET=utf8 ' +
        'COMMENT="user info and password";';

    db.get().query("CREATE TABLE IF NOT EXISTS `user` (`id` int(11) NOT NULL, `password` varchar(45) DEFAULT NULL, ' + 'PRIMARY KEY (`id`)",function (err, rows){
            if (err) console.log(err);
        }
    )
};

exports.createPublicUser = function() {
    const publicUserTable = 'CREATE TABLE `public_user` (`id` int(11) NOT NULL, `username` varchar(45) DEFAULT NULL, ' +
        '`location` varchar(45) DEFAULT NULL, `email` varchar(45) DEFAULT NULL, PRIMARY KEY (`id`), ' +
        'CONSTRAINT `user_id_ref_public` FOREIGN KEY (`id`) REFERENCES `user` (`id`) ' +
        'ON DELETE NO ACTION ON UPDATE NO ACTION) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT="basic info about user";';

    db.get().query(publicUserTable,function (err, rows){
            if (err) console.log(err);
        }
    )
};