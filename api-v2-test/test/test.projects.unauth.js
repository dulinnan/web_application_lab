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
    validator = require('../lib/validator'),
    common = require('../lib/common'),
    initApp = require('../lib/app.init');

// attach chaiHttp so can mock req and res for tests
chai.use(chaiHttp);


describe('given a clean db', function() {

    let app, project1, user1Id, project1Id, token, earliestDate;

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

    beforeEach('setup user and project', function() {
        earliestDate = Math.floor(new Date(Date.now()).getTime()/1000)*1000; // now, in UTC seconds (precision of MySQL clock)
        return common.createUser(app, common.userTemplate('loki', 'loki@valhalla.biz', 'toki'))
                     .then(_id => user1Id = _id)
                     .then(() => common.loginUser(app, 'loki', 'toki'))
                     .then(_token => token = _token)
                     .then(() => {
                            project1 = common.projectTemplate('loki', user1Id);
                            return common.createProject(app, project1, token)
                     })
                     .then(_id => project1Id = _id)
                     .then(() => common.logoutUser(app, token))
    });

    describe('given a project and an unauthorized user', function () {

        describe('when get a project', function () {
            it('should return that project', function () {
                return chai.request(app)
                           .get(`/projects/${project1Id}`)
                           .then(res => {
                               res.should.have.status(200);
                               validator.isValidSchema(res.body, 'definitions.ProjectDetails').should.be.true;
                               // could do something clever with object manipulations to compare res.body and project1, but...
                               res.body.id.should.equal(project1Id);
                               res.body.title.should.equal(project1.title);
                               res.body.subtitle.should.equal(project1.subtitle);
                               res.body.target.should.equal(project1.target);
                               res.body.open.should.be.true;
                               res.body.creationDate.should.be.within(earliestDate, new Date(Date.now()).getTime());  // all times UTC
                               res.body.creators.should.have.lengthOf(1);
                               res.body.creators[0].id.should.equal(user1Id);
                               res.body.creators[0].username.should.equal('loki')
                           });
            })
        });

        describe('when update rewards for a project', function () {
            it('should return 401', function () {
                return chai.request(app)
                           .put(`/projects/${project1Id}/rewards`)
                           .send(common.projectTemplate('loki', user1Id).rewards)
                           .then(
                               (res) => expect.fail(res.statusCode, 401, `status code ${res.statusCode} instead of 401`),
                               (res) => res.should.have.status(401))
            });
        });

        describe('when add image', function () {
            it('should return 401', function () {
                return chai.request(app)
                           .put(`/projects/${project1Id}/image`)
                           .set('Content-Type', 'image/png')
                           .send(common.image('png'))
                           .then(
                               (res) => expect.fail(res.statusCode, 401, `status code ${res.statusCode} instead of 401`),
                               (res) => res.should.have.status(401))
            });
        });

        describe('when get a non-existent project', function () {
            it('should return 404', function () {
                return chai.request(app)
                           .get(`/projects/123`)
                           .then(
                               (res) => expect.fail(res.statusCode, 404, `status code ${res.statusCode} instead of 404`),
                               (res) => res.should.have.status(404))
            })
        });

        describe('when create a project', function () {
            it('should return 401', function () {
                return chai.request(app)
                           .post(`/projects`)
                           .send(common.projectTemplate('loki', user1Id))
                           .then(
                               (res) => expect.fail(res.statusCode, 401, `status code ${res.statusCode} instead of 401`),
                               (res) => res.should.have.status(401))
            });
        });

        describe('when post change of status to `closed`', function () {
            it('should return 401 and status should remain `open`', function() {
                return chai.request(app)
                           .put(`/projects/${project1Id}`)
                           .send({open: false})
                           .then(
                               (res) => expect.fail(res.statusCode, 401, `status code ${res.statusCode} instead of 401`), 
                               (res) => res.should.have.status(401))
                //TODO: check status remains open
            })
        });


        describe('when pledge to project', function () {
            it('should return 401', function () {
                return chai.request(app)
                           .post(`/projects/${project1Id}/pledge`)
                           .send(common.pledgeTemplate())
                           .then(
                               (res) => expect.fail(res.statusCode, 401, `status code ${res.statusCode} instead of 401`),
                               (res) => res.should.have.status(401))
            })
        })

    })
});
