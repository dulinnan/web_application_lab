/**
 * Created by ldu32 on 16/08/17.
 */
const User = require('../models/user.server.model');
const uuidV4 = require('uuid/v4');
const nJwt = require('njwt');
const jwt_decode = require('jwt-decode');

exports.list = function(req, res){
    let id = req.params.id;
    User.getAllUsers(id, function (err, result) {

        // console.log(err);
        if (err) {
            res.send(404).send("User not found");
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
        if (result.length === null) {
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

    User.checkIfUsernameDuplicate(username, function (err, result) {
        // console.log({"RESULT1": result});
        if (result.length === null) {
            res.status(400).send("ERROR - Username already exists!");
            User.insertUsers(password, function (err, result) {
                if(err){
                    res.sendStatus(400);
                } else {
                    let insertId = result['insertId'];
                    let claims = {
                        userid: insertId,
                        password: password
                    };
                    let secretKey = uuidV4();

                    let jwt = nJwt.create(claims,secretKey);
                    let token = jwt.compact();
                    User.insert(insertId, username, location, email, function (err, result) {
                        if (err) {
                            res.status(400).send("Malformed request2");
                        } else {
                            User.insertToken(insertId, token, function (err, result) {
                                if (err) {
                                    res.status(400).send("Malformed request1");
                                }
                            });
                            res.json(result);
                        }
                    });
                }
            })
        }
    })
};

exports.login = function(req, res){
    let username = req.query.username;
    let password = req.query.password;

    User.checkIfUsernameDuplicate(username, function (err, result) {
        if (result.length === null) {
            res.status(400).send("Invalid username/password supplied");
        } else {
            let userId = result[0]['id'];
            User.requestToken(userId, function (err, result) {
                if (err) {
                    res.status(400).send("Invalid username/password supplied");
                } else {
                    let reqToken = result[0]['token'];
                    let decoded = jwt_decode(reqToken);

                    let reqID = decoded['userid'];
                    let reqPassword = decoded['password'];
                    let loginJson = {"id": reqID, "token": reqToken};
                    if (reqID === userId && reqPassword === password) {
                        User.login(reqID, function (err, result) {
                            if (err) {
                                res.status(400).send("Invalid username/password");
                            }
                            else {
                                res.status(200).send(loginJson);
                            }
                        })
                    } else {
                        res.status(400).send("Invalid username/password");
                    }
                }
            })
        }
    });
};

exports.logout = function(req, res){
    let reqToken = req.get('X-Authorization');
    let decoded = jwt_decode(reqToken);
    let reqID = decoded['userid'];

    User.checkIfAlreadyLogout(reqID, function (err, result) {
        let loginBoolean = result[0]['loginBoolean'];
        if (result.length === null) {
            res.status(401).send("Unauthorized - already logged out");
        } else {
            if (loginBoolean === 1) {
                User.logout(reqID, function (err, result) {
                    if (err) {
                        res.status(401).send("Unauthorized - already logged out");
                    } else {
                        res.sendStatus(200);
                    }
                });
            } else {
                res.status(401).send("Unauthorized - already logged out");
            }
        }
    })
};