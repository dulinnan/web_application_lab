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
    let data = [];
    let backer_list = [];
    let progress_list = [];
    let rewards_list = [];
    let rewards_lists = {};
    let rewards_queue = {};
    let creator_list = [];
    let project_data_list = [];
    let project_data_queue = {};
    let project_detail_list = [];
    let project_detail_queue = {};

    Project.getProjectDetail(project_id, function (err, result){
        if (err) {
            res.sendStatus(400);
            // res.json("Malformed request");
        } else {
            for (let item of result) {
                let project_detail_lists = {
                    "id": item['project_id'],
                    "creationDate": item['creation_date']
                };
                project_detail_queue = {"project": project_detail_lists};
                data[0] = project_detail_queue;
            }
            // console.log(data);
        }

        Project.getOneProjectData(project_id, function (err, result){
            if (err) {
                res.sendStatus(400);
                // res.json("Malformed request");
            } else {
                for (let item of result) {
                    let project_data_lists = {
                        "title": item['title'],
                        "subtitle": item['subtitle'],
                        "image_uri": item['image_uri'],
                        "description": item['description'],
                        "target": item['target']
                    };
                    project_data_list.push(project_data_lists);
                    data[0]['project']["data"] = project_data_lists;
                }
            }

            Project.getProjectCreator(project_id, function (err, result) {
                if (err) {
                    res.sendStatus(400);
                } else {
                    for (let item of result) {
                        let creator_lists = {
                            "id": item['creator_id'],
                        };
                        creator_list.push(creator_lists);
                        rewards_queue = {creator_list};
                        data[0]['project']["data"]['creator'] = creator_lists;
                    }

                    console.log(data[0]);
                }

                Project.getRewardsPerProject(project_id, function (err, result) {
                    if (err) {
                        res.sendStatus(400);
                    } else {
                        for (let item of result) {
                            rewards_lists = {
                                "id": item['reward_id'],
                                "amount": item['amount'],
                                "description": item['description']
                            };
                        }

                    }


                });
            });
        });
    });

    Project.getBacker(project_id, function (err, result) {
        if (err) {
            res.sendStatus(400);
            // res.json("Malformed request");
        } else {
            for (let item of result) {
                let back_list = {
                    "name":item['username'],
                    "amount":item['amount']
                };
                backer_list.push(back_list) ;
            }
            let backer_queue = {"backers": backer_list};
            res.json(backer_queue);
        }

        Project.updateProgress(project_id, function (err, result) {
            if (err) {
                res.sendStatus(400);
            }
            console.log("pass updateProgress");
            Project.getProgress(project_id, function (err, result) {
                if (err) {
                    res.sendStatus(400);
                } else {
                    for (let item of result) {
                        let progress_lists = {
                            "target":item['target'],
                            "currentPledged": item['current_pledged'],
                            "numberOfBackers": item['number_of_backers']
                        };
                        progress_list.push(progress_lists);
                    }
                    console.log("pass getProgress");
                }

            });
        });
    });



    //

    //

    //

    //

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
        "user_id": req.body.id,
        "amount": req.body.amount,
        "anonymous": req.body.anonymous};

    let user_id = pledge_data['user_id'].toString();
    let amount = pledge_data['amount'].toString();
    let anonymous = pledge_data['anonymous'].toString();

    Project.getBackID(project_id, function (err, result, next) {
        if (err) {
            // res.sendStatus(404);
            res.json("NOT FOUND");
        } else {
            if (user_id in result) {
                // res.sendStatus(403);
                res.json("Forbidden - cannot pledge to own project - this is fraud!");
            }
            next()
        }
    });

    Project.postPledge(amount,anonymous,project_id, user_id, function (err, result) {
        if (err) {
            // res.sendStatus(400);
            res.json("Bad user, project, or pledge details");
        } else {
            Project.updateProgress(project_id);
            // res.sendStatus(200);
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

exports.updateProgress = function (req, res) {
    let project_id = req.params.id;
    Project.updateProgress(project_id, function (err, result) {

        console.log({"ERR":err});
        console.log({"result":result});
        if (err) {
            res.sendStatus(400);
        } else {
            res.json(result);
        }
    });

}
