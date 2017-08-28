/**
 * Created by ldu32 on 19/08/17.
 */
const Project = require('../models/project.server.model');
const jwt_decode = require('jwt-decode');

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
    let reqToken = req.get('X-Authorization');
    if (reqToken === undefined) {
        res.status(401).send("Unauthorized - create account to create project");
    } else {
        let decoded = jwt_decode(reqToken);
        let reqID = decoded['userid'];
        let project_data = {
            "title": req.body.title,
            "subtitle": req.body.subtitle,
            "description": req.body.description,
            "imageUri": req.body.imageUri,
            "target": req.body.target,
            "creator_id": req.body.creators[0].id,
            "rewards_id": req.body.rewards[0].id,
            "rewards_amount": req.body.rewards[0].amount,
            "rewards_description": req.body.rewards[0].description
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
        Project.postProject(function (err, result) {
            if (err) {
                res.sendStatus(400);
            }
            project_id = result['insertId'];
            console.log({"PROJECT ID": project_id});
            Project.postProjectData(project_id, title, subtitle, description, imageUri, target, function (err, result) {
                if (err) {
                    res.sendStatus(400);
                }
                Project.postReward(rewards_amount, rewards_description, project_id, function (err) {
                    if (err) {
                        res.sendStatus(400);
                    }
                    Project.postCreator(project_id, creator_id, function (err, result) {
                        if (err) {
                            res.sendStatus(400);
                            res.json("Malformed request");
                        } else {
                            res.json(result);
                        }
                    });
                });
            });
        });
    }
};

exports.listOne = function (req, res) {
    let project_id = req.params.id;
    let data = [];
    let backer_list = [];
    let progress_list = [];
    let rewards_list = [];
    let rewards_lists = {};
    let creator_list = [];
    let project_data_list = [];
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

                        data[0]['project']["data"]['creator'] = creator_list;
                    }
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
                            rewards_list.push(rewards_lists);

                        }
                        data[0]['project']["data"]['rewards'] = rewards_list;

                    }
                    Project.updateProgress(project_id, function (err) {
                        if (err) {
                            res.sendStatus(400);
                        }

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
                                data[0]['progress'] = progress_list;

                            }
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
                                    data[0]['backer'] = backer_list;
                                    res.json(data[0]);
                                }
                            });
                        });
                    });
                });
            });
        });
    });
};

exports.update = function(req, res){
    let reqToken = req.get('X-Authorization');
    if (reqToken === undefined) {
        res.status(401).send("Unauthorized - create account to update project");
    } else {
        let decoded = jwt_decode(reqToken);
        let user_id = decoded['userid'];
        let project_id = req.params.id;
        let project_data = {"open": req.body.open};
        let open_target = parseInt(project_data['open']);
        Project.isOwner(project_id, user_id, function (err, result) {
            if (err || result.length === null) {
                res.status(403).send("Forbidden - unable to update a project you do not own");
                // res.json("Malformed request");
            } else {
                Project.alterClose(project_id, open_target, function (err, result) {
                    if (err) {
                        res.sendStatus(400);
                        // res.json("Malformed request");
                    } else {
                        let rows_matched = result['message'][15];
                        if (rows_matched === 0) {
                            res.sendStatus(404);
                        }
                        else {
                            res.status(201).send(result);
                        }
                    }
                });
            }
        })
    }
};

exports.getImage = function (req, res) {
    let project_id = req.params.id;
    Project.getImage(project_id, function (err, result) {
        if (err) {
            res.sendStatus(400);
            // res.json("Malformed request");
        } else {
            // res.sendStatus(201);
            res.json(result);
        }
    });
};

exports.updateImage = function (req, res) {
    let reqToken = req.get('X-Authorization');
    if (reqToken === undefined) {
        res.status(401).send("Unauthorized - create account to update project");
    } else {
        let decoded = jwt_decode(reqToken);
        let user_id = decoded['userid'];
        let project_id = req.params.id;
        let project_image = {"image": req.body.image};
        let image = project_image['image'];

        Project.isOwner(project_id, user_id, function (err, result) {
            if (err || result.length === null) {
                res.status(403).send("Forbidden - unable to update a project you do not own");
                // res.json("Malformed request");
            } else {
                Project.postImage(project_id, function (err, result) {
                    if (err) {
                        res.sendStatus(400);
                        // res.json("Malformed request");
                    } else {
                        let rows_matched = result['message'][15];
                        if (rows_matched == 0) {
                            res.sendStatus(404);
                        }
                        else {
                            res.json(result);
                        }
                    }
                });
            }
        });
    }
};

exports.insertPledge = function (req, res) {
    let reqToken = req.get('X-Authorization');
    if (reqToken === undefined) {
        res.status(401).send("Unauthorized - create account to update project");
    } else {
        let decoded = jwt_decode(reqToken);
        let reqID = decoded['userid'];
        let project_id = req.params.id;
        let pledge_data = {
            "user_id": req.body.id,
            "amount": req.body.amount,
            "anonymous": req.body.anonymous
        };

        let user_id = pledge_data['user_id'].toString();
        let amount = pledge_data['amount'].toString();
        let anonymous = pledge_data['anonymous'].toString();

        Project.isOwner(project_id, user_id, function (err, result) {
            if (result.length !== 0) {
                res.status(403).send("Forbidden - cannot pledge to own project - this is fraud!");
            } else {
                Project.postPledge(amount, anonymous, project_id, user_id, function (err, result) {
                    if (err) {
                        res.status(400).send("Bad user, project, or pledge details");
                    } else {
                        Project.updateProgress(project_id, function (err, result) {
                            if (err) {
                                res.status(404).send("NOT FOUND");
                            }
                        });
                        res.status(200).send(result);
                    }
                })
            }
        });
    }
};

exports.delete = function(req, res){
    let reqToken = req.get('X-Authorization');
    if (reqToken === undefined) {
        res.status(401).send("Unauthorized - not logged in");
    } else {
        let decoded = jwt_decode(reqToken);
        let reqID = decoded['userid'];
        let delete_id = req.params.id;

        if (reqID !== delete_id) {
            res.status(403).send("Forbidden - account not owned");
        } else {
            Project.getCurrentIDDetail(delete_id, function (err, result) {
                if (result.length === 0) {
                    res.status(404).send("User not found");
                } else {
                    Project.getCurrentCreated(delete_id, function (err, result) {
                        if (result.length !== 0) {
                            Project.updateOpenStatus(delete_id, function (err, result) {
                                if (err) {
                                    res.status(404).send("cant set open");
                                }
                            });
                        }
                        Project.deleteUserOnly(delete_id, function (err, result) {
                            if (err) {
                                res.status(404).send("User not found");
                            } else {
                                res.status(200).send("User deleted");
                            }
                        });
                    });
                }
            });
        }
    }
};