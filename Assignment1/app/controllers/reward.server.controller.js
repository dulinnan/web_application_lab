/**
 * Created by ldu32 on 19/08/17.
 */
const Reward = require('../models/reward.server.model');
exports.list = function(req, res){
    let id = req.params.id;
    Reward.getAll(id, function (err, result) {
        if (err) {
            res.status(404).send("ERROR - NOT FOUND");
        } else {
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
    Reward.checkIfIDExists(id, function (err, result) {
        if (err) res.send(err);
        else
        {
            if (result.length === 0) {
                res.status(404).send("ERROR - NOT FOUND");
            } else{
                Reward.getProjectPerBacker(user_id, id,function (err, result) {
                    if (result.length !== 0) {
                        res.status(403).send("Forbidden- unable to update a project you do not own");
                    } else {
                        Reward.alter(values, function (err, result) {
                            if (err) {
                                res.status(400).send("Malformed request");
                            } else {
                                res.json(result);
                            }
                        });
                    }
                });
            }
        }
    });
};