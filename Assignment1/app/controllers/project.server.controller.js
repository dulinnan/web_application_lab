/**
 * Created by ldu32 on 19/08/17.
 */
const Project = require('../models/project.server.model');
exports.listAll = function(req, res){
    let startIndex = parseInt(req.query.startIndex);
    let count = parseInt(req.query.count);
    Project.getAllProjects(startIndex,count, function (err, result) {
        if (err) {
            res.sendStatus(400);
            res.json("Malformed request");
        } else {
            res.json(result);
        }

    });
};

exports.create = function(req, res){
    let project_data = {
        "title": req.body.title,
        "subtitle": req.body.subtitle,
        "description": req.body.description,
        "imageUri": req.body.imageUri,
        "target": req.body.target,
        "creator_id": req.body.creators[0].id,
        "rewards_id": req.body.rewards[0].id,
        "rewards_amount": req.body.rewards[0].amount,
        "rewards_description": req.body.reward[0].description
    };
    let title = project_data['title'].toString();
    let subtitle = project_data['subtitle'].toString();
    let description = project_data['description'].toString();
    let imageUri = project_data['imageUri'].toString();
    let target = project_data['target'].toString();
    let creator_id = project_data['creator_id'].toString();
    let rewards_id = project_data['rewards_id'].toString();
    let rewards_amount = project_data['rewards_amount'].toString();
    let rewards_description = project_data['rewards_description'].toString();

    let project_id = 0;
    Project.postProject(function (result) {
        project_id = result;
    });
    let valuesProjectData = [
        [project_id, title, subtitle, description, imageUri, target]
    ];
    let valuesReward = [
        [rewards_amount, rewards_description, project_id]
    ];
    Project.postProjectData(valuesProjectData, function (err, next) {
        if (err) {
            res.sendStatus(400);
            res.json("Malformed request");
        } else next()
    });

    Project.postReward(valuesReward, function (err, next) {
        if (err) {
            res.sendStatus(400);
            res.json("Malformed request");
        } else next()
    });

    Project.postCreator(project_id, creator_id, function (err, result) {
        if (err) {
            res.sendStatus(400);
            res.json("Malformed request");
        } else {
            res.sendStatus(201);
            res.json(result);
        }
    });

};

exports.listOne = function (req, res) {
    let project_id = req.params.id;
    let backer_list = {};
    let progress_list = {};
    let rewards_list = {};
    let creator_list = {};
    let project_data_list = {};
    let project_detail_list = {};

    Project.getBacker(project_id, function (err, result, next) {
        if (err) {
            res.sendStatus(400);
            // res.json("Malformed request");
        } else {
            backer_list += result;
            next()
        }
    });

    Project.getProgress(project_id, function (err, result, next) {
        if (err) {
            res.sendStatus(400);
            // res.json("Malformed request");
        } else {
            progress_list += result;
            next()
        }
    });

    Project.getRewardsPerProject(project_id, function (err, result, next) {
        if (err) {
            res.sendStatus(400);
            // res.json("Malformed request");
        } else {
            rewards_list += result;
            next()
        }
    });

    Project.getProjectCreator(project_id, function (err, result, next) {
        if (err) {
            res.sendStatus(400);
            // res.json("Malformed request");
        } else {
            creator_list += result;
            next()
        }
    });

    Project.getOneProjectData(project_id, function (err, result, next){
        if (err) {
            res.sendStatus(400);
            // res.json("Malformed request");
        } else {
            project_data_list += result;
            project_data_list += creator_list;
            project_data_list += rewards_list;
            next()
        }
    });

    Project.getProjectDetail(project_id, function (err, result){
        if (err) {
            res.sendStatus(400);
            // res.json("Malformed request");
        } else {
            project_detail_list += result;
            project_detail_list += project_data_list;
            project_detail_list += progress_list;
            project_detail_list += backer_list;
            // res.sendStatus(201);
            res.json(project_detail_list);
        }
    });
};

exports.update = function(req, res){
    let project_id = req.params.id;
    let project_data = {"open": req.body.open};
    let open_status = project_data['open'].toString;

    Project.alterClose(project_id, open_status, function (err, result) {
        if (err) {
            res.sendStatus(400);
            res.json("Malformed request");
        } else {
            res.sendStatus(201);
            res.json(result);
        }
    })

};

exports.getImage = function (req, res) {
    let project_id = req.params.id;
    Project.getImage(project_id, function (err, result) {
        if (err) {
            res.sendStatus(400);
            res.json("Malformed request");
        } else {
            res.sendStatus(201);
            res.json(result);
        }
    });

};

exports.updateImage = function (req, res) {
    let project_id = req.params.id;
    let project_image = {"image": req.body.image};
    let image = project_image['image'];

    Project.getProjectCreator(project_id, function (err, result, next) {
        if (err) {
            res.sendStatus(400);
            res.json("Malformed request");
        } else {
            if (!user_id in result) {
                res.sendStatus(403);
                res.json({"Forbidden":"unable to update a project you do not own"});
            }
        }
        next()
    });

    Project.postImage(project_id, function (err, result) {
        if (err) {
            res.sendStatus(404);
            res.json("NOT FOUND");
        } else {
            res.sendStatus(201);
            res.json(result);
        }
    });
};

exports.insertPledge = function (req, res) {
    let project_id = req.params.id;
    let pledge_data = {
        "amount": req.body.amount,
        "anonymous": req.body.anonymous};

    let amount = pledge_data['amount'].toString();
    let anonymous = pledge_data['anonymous'].toString();

    Project.getBackID(project_id, function (err, result, next) {
        if (err) {
            res.sendStatus(404);
            res.json("NOT FOUND");
        } else {
            if (user_id in result) {
                res.sendStatus(403);
                res.json("Forbidden - cannot pledge to own project - this is fraud!");
            }
            next()
        }
    });

    Project.postPledge(amount,anonymous,project_id, user_id, function (err, result) {
        if (err) {
            res.sendStatus(400);
            res.json("Bad user, project, or pledge details");
        } else {
            Project.updateProgress(project_id);
            res.sendStatus(200);
            res.json(result);
        }
    })
};


exports.delete = function(req, res){
    let delete_id = req.params.id;

    Project.getCurrentIDDetail(delete_id, function (err, result, next) {
        if (err) {
            res.sendStatus(404);
            res.json("User not found");
        }
        next()
    });

    Project.getCurrentCreated(delete_id, function (err, result, next) {
        if (!err){
            Project.updateOpenStatus(delete_id);
        }
        next()
    });

    Project.deleteUserOnly(delete_id, function (err, result) {
        if (err) {
            res.sendStatus(400);
            res.json("User not found");
        } else {
            res.sendStatus(200);
            res.json("User deleted");
            res.json(result);
        }
    });
};
