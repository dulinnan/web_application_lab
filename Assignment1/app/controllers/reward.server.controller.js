/**
 * Created by ldu32 on 19/08/17.
 */
const Reward = require('../models/reward.server.model');
exports.list = function(req, res){
    Reward.getAll(function (result) {
        res.json(result);
    });
};

exports.create = function(req, res){
    let user_data = {
        "username": req.body.username
    };
    console.log(user_data);
    let user = user_data['username'].toString();

    let values = [
        [user]
    ];

    Reward.insert(values, function (result) {
        res.json(result);
    });
};

exports.read = function(req, res){
    return null;
};

exports.update = function(req, res){
    return null;
};

exports.delete = function(req, res){
    return null;
};
