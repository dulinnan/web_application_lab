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
    app, user1Id, user2Id, token;

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

    beforeEach('create user1', function() {
        return common.createUser(app, common.userTemplate('loki', 'loki@valhalla.biz', 'toki'))
                     .then(_id => user1Id = _id)
    });

    describe('when login with correct username and password', function () {
        it('should return 200', function () {
            return common.loginUser(app, 'loki', 'toki')
        });
    });

    describe('when login with correct email and password', function() {
        it('should return 200', function () {
            return chai.request(app)
                       .post(`/users/login`)
                       .query({email: 'loki@valhalla.biz', password: 'toki'})
                       .then(res => {
                           res.should.have.status(200);
                           res.body.should.have.property('id');
                           res.body.should.have.property('token');
                           let id = parseInt(res.body.id);
                           expect(id).to.not.be.NaN; // will fail if id=NaN
                       })
        })
    });

    describe('when login with correct username and incorrect password', function () {
        it('should return 400', function () {
            return common.loginUser(app, 'loki', 'loki')
                         .then(
                             (res) => expect.fail(res.statusCode, 400, `status code ${res.statusCode} instead of 400`),
                             (res) => res.should.have.status(400))
        });
    });

    describe('when login with correct email and incorrect password', function() {
        it('should return 400', function () {
            return chai.request(app)
                       .post(`/users/login`)
                       .query({email: 'loki@valhalla.biz', password: 'loki'})
                       .then(
                           (res) => expect.fail(res.statusCode, 400, `status code ${res.statusCode} instead of 400`),
                           (res) => res.should.have.status(400))
        })
    });

    describe('Given two users and logged in as user1', function() {

        beforeEach('login as user1 and create user 2', function() {
            return common.loginUser(app, 'loki', 'toki')
                         .then(_token => token = _token)
                         .then(() => common.createUser(app, common.userTemplate('toki', 'toki@valhalla.biz', 'loki')))
                         .then(_id => user2Id = _id)
        });

        describe('when update own user while logged in', function () {
            it('should return 200', function () {
                return chai.request(app)
                           .put(`/users/${user1Id}`)
                           .set(config.get('authToken'), token)
                           .send(common.userTemplate('loki', 'loki@valhalla.biz', 'toki'))
                           .then(res => res.should.have.status(200))
            });
        });

        describe('when get own user while logged in', function () {
            it('should return 200', function () {
                return chai.request(app)
                           .get(`/users/${user1Id}`)
                           .set(config.get('authToken'), token)
                           .then(res => {
                               validator.isValidSchema(res.body, 'definitions.PublicUser').should.be.true;
                               res.body.username.should.equal(user1.username);
                               res.body.email.should.equal(user1.email);
                               res.body.location.should.equal(user1.location);
                               res.should.have.status(200);
                           })
            });
        });

        describe('when try to login while already logged in', function() {
            it('should return 400', function () {
                return common.loginUser(app, 'loki', 'toki')
                             .then(
                                 (res) => expect.fail(res.statusCode, 400, `status code ${res.statusCode} instead of 400`),
                                 (res) => {
                                     res.should.have.status(400);
                                     res.response.text.should.equal('Already logged in')
                                 })
            })
        });

        describe('when attempt to get another user while logged in', function () {
            it('should return 403', function () {
                return chai.request(app)
                           .get(`/users/${user2Id}`)
                           .set(config.get('authToken'), token) // auth as user1
                           .then(
                               (res) => expect.fail(res.statusCode, 403, `status code ${res.statusCode} instead of 403`),
                               (res) => res.should.have.status(403))
            });
        });

        describe('when two users exist and update other user', function () {
            it('should return 403', function () {
                return chai.request(app)
                           .put(`/users/${user2Id}`)  // update user2
                           .set(config.get('authToken'), token) // auth as user1
                           .send(common.userTemplate('newtoki', 'toki@hel.org', 'newpassword'))
                           .then(
                               (res) => expect.fail(res.statusCode, 403, `status code ${res.statusCode} instead of 403`),
                               (res) => res.should.have.status(403))
            });
        });

        describe('when two users exist and delete other user', function () {
            it('should return 403', function () {
                return chai.request(app)
                           .del(`/users/${user2Id}`)  // delete user2
                           .set(config.get('authToken'), token) // auth as user1
                           .then(
                               (res) => expect.fail(res.statusCode, 403, `status code ${res.statusCode} instead of 403`),
                               (res) => res.should.have.status(403))
            });
        });

        describe('when delete own user while logged in', function () {
            it('should return 200', function () {
                return chai.request(app)
                           .del(`/users/${user1Id}`)
                           .set(config.get('authToken'), token)
                           .then(res => res.should.have.status(200))
            });
        });

        describe('when get own deleted user while logged in', function () {
            it('should return 401 as can not be authorized as non-existent user', function () {
                return chai.request(app)
                           .del(`/users/${user1Id}`)
                           .set(config.get('authToken'), token)
                           .then(res => {
                               res.should.have.status(200);
                               return chai.request(app)
                                          .get(`/users/${user1Id}`)
                                          .set(config.get('authToken'), token)
                                          .then(
                                              (res) => expect.fail(res.statusCode, 401, `status code ${res.statusCode} instead of 401`),
                                              (res) => res.should.have.status(401))
                           })

            });
        });

    })
});
