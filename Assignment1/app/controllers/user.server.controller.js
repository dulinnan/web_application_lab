/**
 * Created by ldu32 on 16/08/17.
 */
const User = require('../models/user.server.model');
const uuidV4 = require('uuid/v4');

exports.list = function(req, res){
    let id = req.params.id;
    User.getAllUsers(id, function (err, result) {

        // console.log(err);
        if (err) {
            res.sendStatus(404);
        } else {
            res.json(result);
        }
    });
};

exports.update = function(req, res){
    let id = req.params.id;
    let user_data = {
        "username": req.body.user.username,
        "location": req.body.user.location,
        "email": req.body.user.email,
        "password": req.body.password
    };
    let username = user_data['username'].toString();
    let location = user_data['location'].toString();
    let email = user_data['email'].toString();
    let password = user_data['password'].toString();

    User.checkIfIDExists(id, function (err, result) {
        if (result.length === 0) {
            res.sendStatus(404).send("ERROR - User not found");
        } else {
            User.alter(id, username, location, email, function (err, result) {
                if (err) {
                    res.status(400).send("Malformed request");
                } else {
                    res.json(result);
                }
            });
        }
    });
};

exports.create = function(req, res){

    // const secretKey = "1QiLCJhbGciOiJIUzI1NiJ9.eyJqdGki";
    let secretKey = uuidV4();

    let user_data = {
        "username": req.body.user.username,
        "location": req.body.user.location,
        "email": req.body.user.email,
        "password": req.body.password
    };
    let username = user_data['username'].toString();
    let location = user_data['location'].toString();
    let email = user_data['email'].toString();
    let password = user_data['password'].toString();

    let claims = {
        username: 'username',
        password: 'password'
    };

    User.checkIfUsernameDuplicate(username, function (err, result) {
        console.log({"RESULT": result});
        if (result.length != 0) {
            res.status(400).send("ERROR - Username already exists!");
        } else {
            User.insertUsers(password, function (err, result) {
                if(err){
                    res.sendStatus(400);
                } else {
                    let insertId = result['insertId'];
                    User.insert(insertId, username, location, email, function (err, result) {
                        if (err) {
                            res.status(400).send("Malformed request");
                        } else {
                            res.json(result);
                        }
                    });
                }
            })
        }
    })
};

exports.login = function(req, res){
    let username = req.body.username;
    let password = req.body.password;
};

exports.logout = function(req, res){
    return null;
};
