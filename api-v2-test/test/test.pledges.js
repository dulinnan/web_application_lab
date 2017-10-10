"use strict";

/**
 * Tests for /projects endpoint. assumes that the SUT is up-and-running with a clean db at the location given in config.
 * unlike most unit tests, we cannot reset to a clean state in between tests. Correct sequencing of the tests is therefore critical.
 *
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


describe('given user1 (loki) and user2 (toki), and authenticated as user2, and project1 owned by user1', function() {

    let app, user1Id, user2Id, project1Id, project2Id, token2;

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

    beforeEach('setup two users, one logged in, and one project', function() {
        let token;

        return common.createUser(app, common.userTemplate('loki', 'loki@valhalla.biz', 'toki'))
                  .then(_id => user1Id = _id)
                  .then(() => common.loginUser(app, 'loki', 'toki'))
                  .then(_token => token = _token)
                  .then(() => common.createProject(app, common.projectTemplate('loki', user1Id), token))
                  .then(_id => project1Id = _id)
                  .then(() => common.logoutUser(app, token))
                  .then(() => common.createUser(app, common.userTemplate('toki', 'toki@valhalla.biz', 'loki')))
                  .then(_id => user2Id = _id)
                  .then(() => common.loginUser(app, 'toki', 'loki'))
                  .then(_token => token2 = _token)
        });

    describe('when pledge as user2Id to project1', function() {
        it('should return 201 and backers should increase and pledged should increase', function() {
            return common.makePledge(app, project1Id, common.pledgeTemplate(user2Id, false, 250), token2)
                       .then(() => {
                            return common.getProject(app, project1Id)
                                .then(project => {
                                    validator.isValidSchema(project,'definitions.ProjectDetails').should.be.true;
                                    project.backers.should.have.lengthOf(1);
                                    project.backers[0].id.should.equal(user2Id);
                                    project.backers[0].username.should.equal('toki');
                                    project.backers[0].amount.should.equal(250);
                                    project.progress.currentPledged.should.equal(250);
                                    project.progress.numberOfBackers.should.equal(1);
                                })
                       })
        })
    });

    describe('when pledge as user2Id anonymously to project1', function() {
        it('should return 201 and backers should be 1 (anonymous) and pledged should increase', function() {
            return common.makePledge(app, project1Id, common.pledgeTemplate(user2Id, true, 250), token2)
                         .then(() => {
                             return common.getProject(app, project1Id)
                                          .then(project => {
                                              validator.isValidSchema(project,'definitions.ProjectDetails').should.be.true;
                                              project.backers.should.have.lengthOf(1);
                                              project.backers[0].id.should.equal(user2Id);
                                              project.backers[0].username.should.equal('anonymous');
                                              project.backers[0].amount.should.equal(250);
                                              project.progress.currentPledged.should.equal(250);
                                              project.progress.numberOfBackers.should.equal(1);
                                          })
                         })
        })
    });

    describe('when pledge twice as user2Id to project1', function() {
        it('pledges/backers should equal 2 and pledged should increase by total and numberOfBackers should be 1', function() {
            return common.makePledge(app, project1Id, common.pledgeTemplate(user2Id, false, 250), token2)
                         .then(() => common.makePledge(app, project1Id, common.pledgeTemplate(user2Id, false, 125), token2))
                         .then(() => {
                             return common.getProject(app, project1Id)
                                          .then(project => {
                                              validator.isValidSchema(project,'definitions.ProjectDetails').should.be.true;
                                              project.backers.should.have.lengthOf(2);
                                              project.backers[0].amount.should.equal(125);
                                              project.backers[1].amount.should.equal(250);
                                              project.progress.currentPledged.should.equal(375);
                                              project.progress.numberOfBackers.should.equal(1);
                                          })
                         })
        })
    });

    describe('when pledge twice as user2Id and twice as anonymous user2Id to project1', function() {
        it('pledges/backers should equal 4 (two user2Id and two anonymous) and pledged should increase by total and numberOfBackers should be only 2', function() {
            return common.makePledge(app, project1Id, common.pledgeTemplate(user2Id, false, 250), token2)
                         .then(() => common.makePledge(app, project1Id, common.pledgeTemplate(user2Id, false, 125), token2))
                         .then(() => common.makePledge(app, project1Id, common.pledgeTemplate(user2Id, true, 25), token2))
                         .then(() => common.makePledge(app, project1Id, common.pledgeTemplate(user2Id, true, 55), token2))
                         .then(() => {
                             return common.getProject(app, project1Id)
                                          .then(project => {
                                              validator.isValidSchema(project,'definitions.ProjectDetails').should.be.true;
                                              project.backers.should.have.lengthOf(4);
                                              project.backers[0].amount.should.equal(55);
                                              project.backers[1].amount.should.equal(25);
                                              project.backers[2].amount.should.equal(125);
                                              project.backers[3].amount.should.equal(250);
                                              project.progress.currentPledged.should.equal(250+125+25+55);
                                              project.progress.numberOfBackers.should.equal(2); // user2Id and anonymous
                                          })
                         })
        })
    });

});