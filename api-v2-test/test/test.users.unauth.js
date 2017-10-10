"use strict";

/**
 * apitest tests for /user endpoint. assumes that the SUT is up-and-running with a clean db at the location given in config.
 * unlike most unit tests, we cannot reset to a clean state in between tests. Correct sequencing of the tests is therefore critical.
 * 
 * superAgent (in chai-http) rejects all status codes from 400 upwards, so in those cases we
 * have to catch the errors rather than using the normal `then` (see https://github.com/chaijs/chai-http/issues/75)
 *
 */

const
    config = require('../config.js'),
    log = require('../logger')(config.get('log')),
    chai = require('chai'),
    chaiHttp = require('chai-http'),
    validator = require('../lib/validator'),
    should = chai.should(),
    expect = chai.expect,
    initApp = require('../lib/app.init'),
    common = require('../lib/common');

// attach chaiHttp so can mock req and res for tests
chai.use(chaiHttp);


const
    user1 = common.userTemplate('loki', 'loki@valhalla.biz', 'toki');

let
    app, user1Id, user2Id;

describe('given a clean db', function() {

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

    beforeEach('setup', function() {
        return common.createUser(app, common.userTemplate('loki', 'loki@valhalla.biz', 'toki'))
                     .then(_id => user1Id = _id)
    });

    describe('Given a user exists, but not logged in', function() {

        describe('when create a user with duplicate username', function() {
            it('should return 400', function() {
                return chai.request(app)
                           .post(`/users`)
                           .send(common.userTemplate('loki', 'loki@hel.org', 'toki'))
                           .then(
                               (res) => expect.fail(res.statusCode, 400, `status code ${res.statusCode} instead of 400`),
                               (res) => res.should.have.status(400))
            });
        });

        describe('when create a user with duplicate email', function() {
            it('should return 400', function() {
                return chai.request(app)
                           .post(`/users`)
                           .send(common.userTemplate('loki2', 'loki@valhalla.biz', 'toki'))  // different username, same email
                           .then(
                               (res) => expect.fail(res.statusCode, 400, `status code ${res.statusCode} instead of 400`),
                               (res) => res.should.have.status(400))
            });
        });

        describe('when get own user while not logged in', function () {
            it('should return 401)', function () {
                return chai.request(app)
                           .get(`/users/${user1Id}`)
                           .then(
                               (res) => expect.fail(res.statusCode, 401, `status code ${res.statusCode} instead of 401`),
                               (res) => res.should.have.status(401))
            });
        });

        describe('when update own user while not logged in', function() {
            it('should return 401', function() {
                return chai.request(app)
                   .put(`/users/${user1Id}`)
                   .send(common.userTemplate('newloki', 'newemail@valhalla.biz', 'password'))
                           .then(
                               (res) => expect.fail(res.statusCode, 401, `status code ${res.statusCode} instead of 401`),
                               (res) => res.should.have.status(401))
            });
        });

        describe('when delete own user while not logged in', function() {
            it('should return 401', function() {
                return chai.request(app)
                           .del(`/users/${user1Id}`)
                           .then(
                               (res) => expect.fail(res.statusCode, 401, `status code ${res.statusCode} instead of 401`),
                               (res) => res.should.have.status(401))
            });
        });

        describe('when login with username and wrong credentials', function() {
            it('should return 400', function() {
                return chai.request(app)
                           .post(`/users/login`)
                           .query({username: 'loki', password: 'wrong'})
                           .then(
                               (res) => expect.fail(res.statusCode, 400, `status code ${res.statusCode} instead of 400`),
                               (res) => res.should.have.status(400))
            });
        });

        describe('when login with email and wrong credentials', function() {
            it('should return 400', function() {
                return chai.request(app)
                           .post(`/users/login`)
                           .query({email: 'loki@valhalla.biz', password: 'wrong'})
                           .then(
                               (res) => expect.fail(res.statusCode, 400, `status code ${res.statusCode} instead of 400`),
                               (res) => res.should.have.status(400))
            });
        });

        describe('when create a second user', function() {
            it('should return a userid', function() {
                return chai.request(app)
                           .post(`/users`)
                           .send(common.userTemplate('toki', 'toki@valhalla.biz', 'toki'))
                           .then(res => {
                               res.should.have.status(201);
                               user2Id = parseInt(res.body.id);
                               expect(user2Id).to.not.be.NaN; // will fail if id=NaN
                           })
            });
        });


        describe('when get another user while not logged in', function() {
            it('should return 401', function() {
                return chai.request(app)
                           .get(`/users/${user2Id}`)
                           .then(
                               (res) => expect.fail(res.statusCode, 401, `status code ${res.statusCode} instead of 401`),
                               (res) => res.should.have.status(401))
            });
        });

    });

});
