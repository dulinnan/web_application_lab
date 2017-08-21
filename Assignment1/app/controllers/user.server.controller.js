/**
 * Created by ldu32 on 16/08/17.
 */
const User = require('../models/user.server.model');

exports.list = function(req, res){
    let id = req.params.id;
    User.getAllUsers(id, function (err, result) {
        if (err) {
            res.sendStatus(404);
        } else {
            res.sendStatus(200);
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
    let values = [
        [id, username, location, email]
    ];

    if (id != user_id) {
        res.sendStatus(403);
        res.json({"Forbidden":"account not owned"});
    }

    User.checkIfIDExists(id, function (err) {
        if (err) {
            res.sendStatus(404);
            res.json({"ERROR":"User not found"});
        }
    });

    User.alter(values, function (err, result) {
        if (err) {
            res.sendStatus(400);
            res.json("Malformed request");
        } else {
            res.sendStatus(201);
            res.json(result);
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
    // let values = [
    //     [id, username, location, email]
    // ];
    User.checkIfUsernameDuplicate(username, function (err) {
        if (!err) {
            res.sendStatus(400);
            res.json({"ERROR":"Username already exists!"});
        } else {
            User.insert(function (err, result) {
                if (err) {
                    res.sendStatus(400);
                    res.json("Malformed request");
                } else {
                    res.sendStatus(201);
                    res.json(result);
                }
            });
        }
    })
};

exports.delete = function(req, res){
    let id = req.params.id;
    TODO
};

exports.login = function(req, res){
    let username = req.body.username;
    let password = req.body.password;


};

exports.logout = function(req, res){
    return null;
};
