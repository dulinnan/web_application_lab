/**
 * Created by ldu32 on 19/08/17.
 */
const Reward = require('../models/reward.server.model');
const jwt_decode = require('jwt-decode');

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
    let reqToken = req.get('X-Authorization');
    if (reqToken === undefined) {
        res.status(401).send("Unauthorized - not logged in");
    } else {
        let decoded = jwt_decode(reqToken);
        let reqID = decoded['userid'];
        let id = req.params.id;
        let user_data = {
            "amount": req.body.amount,
            "description": req.body.description
        };
        let amount = user_data['amount'].toString();
        let description = user_data['description'].toString();
        let values = [
            [reqID, amount, description, id]
        ];
        Reward.checkIfIDExists(id, function (err, result) {
            if (err) res.send(err);
            else {
                if (result.length === 0) {
                    res.status(404).send("ERROR - NOT FOUND");
                } else {
                    Reward.getProjectPerBacker(reqID, id, function (err, result) {
                        if (result.length !== 0) {
                            res.status(403).send("Forbidden- unable to update a project you do not own");
                        } else {
                            Reward.alter(values, function (err, result) {
                                if (err) {
                                    res.status(400).send("Malformed request");
                                } else {
                                    res.status(201).send(result);
                                }
                            });
                        }
                    });
                }
            }
        });
    }
};