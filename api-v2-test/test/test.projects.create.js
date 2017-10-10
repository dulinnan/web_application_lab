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
    expect = chai.expect,
    should = chai.should(),
    common = require('../lib/common'),
    initApp = require('../lib/app.init');

// attach chaiHttp so can mock req and res for tests
chai.use(chaiHttp);

describe('given a clean slate', function() {

    let app, user1Id, token;

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

    beforeEach('login as user', function() {
        return common.createUser(app, common.userTemplate('loki', 'loki@valhalla.biz', 'toki'))
              .then(_id => user1Id = _id)
              .then(() => common.loginUser(app, 'loki', 'toki'))
              .then(_token => token = _token)
    });

    describe('when create a project', function() {
        it('should return 201', function() {
            return chai.request(app)
                       .post(`/projects`)
                       .set(config.get('authToken'), token)
                       .send(common.projectTemplate('loki', user1Id))
                       .then(res => {
                           res.should.have.status(201);
                           let id = parseInt(res.body.id);
                           expect(id).to.not.be.NaN; // will fail if id=NaN;
                       })
        });
    });

});
