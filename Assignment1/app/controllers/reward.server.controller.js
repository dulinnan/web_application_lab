/**
 * Created by ldu32 on 19/08/17.
 */
const Reward = require('../models/reward.server.model');
exports.list = function(req, res){
    let id = req.params.id;
    Reward.getAll(id, function (err, result) {
        if (err) {
            res.sendStatus(404);
        } else {
            res.sendStatus(200);
            res.json(result);
        }
    })
};

exports.update = function(req, res){
    let id = req.params.id;
    let user_data = {
        "amount": req.body.amount,
        "description": req.body.description
    };
    let amount = user_data['amount'].toString();
    let description = user_data['description'].toString();
    let values = [
        [user_id, amount, description, id]
    ];
    Reward.checkIfIDExists(id, function (err) {
        if (err) {
            res.sendStatus(401);
            res.json({"Unauthorized":"create account to update project"});
        }
    });
    Reward.getProjectPerBacker(id, function (err, result) {
        if (err) {
            res.sendStatus(404);
            res.json({"ERROR":"NOT FOUND"});
        } else {
            if (!id in result) {
                res.sendStatus(403);
                res.json({"Forbidden": "unable to update a project you do not own"});
            }
        }
    });
    Reward.alter(values, function (result) {
        res.sendStatus(201);
        res.json(result);
    });
};