"use strict";

/**
 * Tests for /projects endpoint. assumes that the SUT is up-and-running with a clean db at the location given in config.
 * unlike most unit tests, we cannot reset to a clean state in between tests. Correct sequencing of the tests is therefore critical.
 *
 * Uses chai and chai-http to hook into the Express app and mock client requests and responses.
 * SuperAgent (in chai-http) rejects all status codes from 400 upwards, so in those cases we
 * have to catch the errors rather than using the normal `then` (see https://github.com/chaijs/chai-http/issues/75)
 */

const
    config = require('../config.js'),
    log = require('../logger')(config.get('log')),
    chai = require('chai'),
    chaiHttp = require('chai-http'),
    should = chai.should(),
    expect = chai.expect,
    validator = require('../lib/validator'),
    common = require('../lib/common'),
    initApp = require('../lib/app.init');

// attach chaiHttp so can mock req and res for tests
chai.use(chaiHttp);


describe('given user1 (loki) and user2 (toki), and authenticated as user2, and two projects, each owned by one user', function() {

    let app, user1Id, user2Id, project1Id, project2Id, token1, token2;

    this.timeout(5000);

    beforeEach('start app', function() {
        return initApp(config)
            .then(_url => app = _url)
            .then(() => chai.request(app).post('/admin/reset'))
            .catch(err => {
                log.fatal(`could not connect to app: ${JSON.stringify(err)}`);
                process.exit(1);
            })
    });

    beforeEach('setup two users, one logged in, and two projects', function() {

        return common.createUser(app, common.userTemplate('loki', 'loki@valhalla.biz', 'toki'))
                  .then(_id => user1Id = _id)
                  .then(() => common.loginUser(app, 'loki', 'toki'))
                  .then(_token => token1 = _token)
                  .then(() => common.createProject(app, common.projectTemplate('loki', user1Id), token1))
                  .then(_id => project1Id = _id)
                  .then(() => common.createUser(app, common.userTemplate('toki', 'toki@valhalla.biz', 'loki')))
                  .then(_id => user2Id = _id)
                  .then(() => common.loginUser(app, 'toki', 'loki'))
                  .then(_token => token2 = _token)
                  .then(() => common.createProject(app, common.projectTemplate('toki', user2Id), token2))
                  .then(_id => project2Id = _id)
        });

    describe('when post change of status to `closed` of owned project1Id', function() {
        it('should return 201 and status should be `closed`', function() {
            return chai.request(app)
                       .put(`/projects/${project1Id}`)
                       .set(config.get('authToken'), token1)
                       .send({open: false})
                       .then(res => {
                           res.should.have.status(201);
                           return chai.request(app)
                                      .get(`/projects/${project1Id}`)
                                      .then(res => {
                                          res.should.have.status(200);
                                          validator.isValidSchema(res.body, 'definitions.ProjectDetails').should.be.true;
                                          res.body.open.should.be.false;
                                      });
                       });
        })
    });

    describe('when two projects exist, one of which is closed, and get projects', function() {


        beforeEach('close project1', function () {
            return chai.request(app)
                       .put(`/projects/${project1Id}`)
                       .set(config.get('authToken'), token1)
                       .send({open: false})
        });

        it('should return a list of two projects', function () {
            return chai.request(app)
                       .get(`/projects`)
                       .then(res => {
                           res.should.have.status(200);
                           res.body.should.have.lengthOf(2);
                           validator.isValidSchema(res.body, 'definitions.ProjectsOverview').should.be.true;
                           // check that only project1Id is closed
                           res.body.every(project => (project.id === project1Id) ? !project.open : project.open).should.be.true;
                       })
        });

        it('when get open projects should return a list of one projects', function () {
            return chai.request(app)
                       .get(`/projects`)
                       .query({open: true})
                       .then(res => {
                           res.should.have.status(200);
                           res.body.should.have.lengthOf(1);
                           validator.isValidSchema(res.body, 'definitions.ProjectsOverview').should.be.true;
                           // check that got project2Id
                           res.body[0].id.should.equal(project2Id)
                       })
        });

        it('when pledge as user to unowned but closed project should return 403', function () {
            return chai.request(app)
                       .post(`/projects/${project1Id}/pledge`)
                       .set(config.get('authToken'), token2)
                       .send(common.pledgeTemplate(user2Id))
                       .then(
                           (res) => expect.fail(res.statusCode, 403, `status code ${res.statusCode} instead of 403`),
                           (res) => res.should.have.status(403))
        });

        it('when post change of status to `closed` to unowned project should return 403', function () {
            return chai.request(app)
                       .put(`/projects/${project2Id}`)
                       .set(config.get('authToken'), token1)
                       .send({open: false})
                       .then(
                           (res) => expect.fail(res.statusCode, 403, `status code ${res.statusCode} instead of 403`),
                           (res) => res.should.have.status(403))
        });

        it('when post change of status to `open` to closed project should return 403', function () {
            return chai.request(app)
                       .put(`/projects/${project1Id}`)
                       .set(config.get('authToken'), token1)
                       .send({open: true})
                       .then(
                           (res) => expect.fail(res.statusCode, 403, `status code ${res.statusCode} instead of 403`),
                           (res) => res.should.have.status(403))
        });
    })
});