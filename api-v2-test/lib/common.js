"use strict";

/**
 * Methods to initialise the db to various known states for testing
 *
 * Use model methods to ensure aren't relying on pathways that can't easily be unit-tested.
 * We explicitly close the db connection pool (obtained from db.connection) after each atomic block of operations,
 * so as to allow these sampledata methods to be used with other db connections on which we may not wish to have
 * `multipleStatements` enabled.
 */

const
    log = require('../logger')({name: 'sampleData',level:'debug'}), // will create new sampleData logger only if a logger does not already exist
    path = require('path'),
    fs = require('fs'),
    config = require('../config.js'),
    chai = require('chai'),
    expect = chai.expect,
    should = chai.should(),
    chaiHttp = require('chai-http');

chai.use(chaiHttp);

exports.userTemplate = (username, email, password) => {
    return {
        username: username,
        location: "Valhalla",
        email: email,
        password: password
    };
};

exports.projectTemplate = (creator, id) => {
    return {
        title: "My awesome project",
        subtitle: "More awesomeness",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
        target: 123400,
        creators: [
            {
                id: id
            }
        ],
        rewards: rewardsTemplate()
    };
};

exports.pledgeTemplate = (id=1, anonymous=false, amount=500) => {
    return {
        id: id,
        amount: amount,
        anonymous: anonymous,
        card: {
            authToken: '7383134dfd2665961c326579c5dc22d1'
        }
    }
};

let rewardsTemplate = exports.rewardsTemplate = () => {
    return [
        {
            amount: 500,
            description: "Cheap and cheerful"
        },
        {
            amount: 1000,
            description: "For the discerning"
        }
    ]
};

exports.image = imageType => {
    let fpath = path.join(__dirname, `../test/resources/test.image.${imageType}`);
    return fs.readFileSync(fpath);
};

/**
 * create a user and return the id for the created user
 *
 * @param app
 * @param user
 * @returns {Promise|<String>}
 */
exports.createUser = (app, user) => {
    return chai.request(app)
               .post(`/users`)
               .send(user)
               .then(res => {
                   res.should.have.status(201);
                   let id = parseInt(res.body.id);
                   expect(id).to.not.be.NaN; // will fail if id=NaN
                   log.info(`user ${user.username} created with id ${id}`);
                   return id;
               })
};

/**
 * log in the given user
 *
 * @param app
 * @param username
 * @param password
 * @returns {Promise|<String>}
 */
exports.loginUser = (app, username, password) => {
    return chai.request(app)
               .post(`/users/login`)
               .query({username: username, password: password})
               .then(res => {
                   res.should.have.status(200);
                   res.body.should.have.property('id');
                   res.body.should.have.property('token');
                   let id = parseInt(res.body.id);
                   expect(id).to.not.be.NaN; // will fail if id=NaN
                   log.info(`user ${username} with id ${id} logged in with ${res.body.token}`);
                   return res.body.token;
               })
};

/**
 * logout the user associated with `token`
 *
 * @param app
 * @param token
 * @returns {Promise}
 */
exports.logoutUser = (app, token) => {
    return chai.request(app)
               .post(`/users/logout`)
               .set(config.get('authToken'), token)
               .then(res => {
                   res.should.have.status(200);
                   log.info(`user logged out with ${token}`);
               })
};

/**
 * Get a project
 *
 * @param app
 * @param projectId
 * @returns {Promise|<String>}
 */
exports.getProject = (app, projectId) => {
    return chai.request(app)
               .get(`/projects/${projectId}`)
               .then(res => {
                   res.should.have.status(200);  // range of status codes ok when doing setup, but remember to check exact value in api tests
                   let id = parseInt(res.body.id);
                   expect(id).to.not.be.NaN; // will fail if id=NaN
                   id.should.equal(projectId);  // confirm have the expected project
                   return res.body;
               })
               .catch(err => log.fatal(err))
};

/**
 * Create a sample project in the test db
 *
 * @param app
 * @param project   sample project in `#/descriptions/ProjectOverview` format
 * @param token
 * @returns {Promise|<String>}
 */
exports.createProject = (app, project, token) => {
    return chai.request(app)
               .post(`/projects`)
               .set(config.get('authToken'), token)
               .send(project)
               .then(res => {
                   res.should.have.status(201);  // range of status codes ok when doing setup, but remember to check exact value in api tests
                   let id = parseInt(res.body.id);
                   expect(id).to.not.be.NaN; // will fail if id=NaN
                   log.info(`project ${project.title} created with id ${id}`);
                   return id;
               })
               .catch(err => log.fatal(err))
};

exports.makePledge = (app, projectId, pledge, token) => {
    return chai.request(app)
               .post(`/projects/${projectId}/pledge`)
               .set(config.get('authToken'), token)
               .send(pledge)
               .then(res => {
                   res.should.have.status(201);
                   let id = parseInt(res.body.id);
                   expect(id).to.not.be.NaN; // will fail if id=NaN
                   return id;
               })
        .catch(err => log.fatal(err))
};