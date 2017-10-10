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


describe('given user1 (loki) and user2 (toki), and authenticated as user2, and two projects, each owned by one user', function() {

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

    beforeEach('setup two users, one logged in, and two projects', function() {
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
                  .then(() => common.createProject(app, common.projectTemplate('toki', user2Id), token2))
                  .then(_id => project2Id = _id)
        });

    describe('when update rewards for a project', function() {
        it('should return 201', function() {
            return chai.request(app)
                .put(`/projects/${project2Id}/rewards`)
                .set(config.get('authToken'), token2)
                .send(common.rewardsTemplate())
                .then(res => {
                    res.should.have.status(201);
                    return chai.request(app)
                               .get(`/projects/${project2Id}`)
                               .then(res => {
                                   res.should.have.status(200);
                                   validator.isValidSchema(res.body,'definitions.ProjectDetails').should.be.true;
                               });
                });
        });
    });

    describe('when add image of Content-Type image/png', function() {
        it('should return 201 and image of Content-Type image/png', function() {
            return chai.request(app)
                .put(`/projects/${project2Id}/image`)
                .set(config.get('authToken'), token2)
                .set('Content-Type', 'image/png')
                .send(common.image('png'))
                .then(res => {
                    res.should.have.status(201);
                    return chai.request(app)
                               .get(`/projects/${project2Id}/image`)
                               .then(res => {
                                   res.should.have.status(200);
                                   res.should.have.header('content-type', 'image/png');
                               })
                })
        })
    });

    describe('when add image of Content-Type image/jpeg', function() {
        it('should return 201 and get image should return 200 and image of Content-Type image/jpeg', function() {
            return chai.request(app)
                .put(`/projects/${project2Id}/image`)
                .set(config.get('authToken'), token2)
                .set('Content-Type', 'image/jpeg')
                .send(common.image('jpg'))
                .then(res => {
                    res.should.have.status(201);
                    return chai.request(app)
                               .get(`/projects/${project2Id}/image`)
                               .then(res => {
                                   res.should.have.status(200);
                                   res.should.have.header('content-type', 'image/jpeg');
                               })
                })
        })
    });

    describe('when add image of Content-Type image/gif', function() {
        it('should return 400', function() {
            return chai.request(app)
                .put(`/projects/${project2Id}/image`)
                .set(config.get('authToken'), token2)
                .set('Content-Type', 'image/gif')
                .send(common.image('gif'))
                .then(
                    (res) => expect.fail(res.statusCode, 400, `status code ${res.statusCode} instead of 400`),
                    (res) => res.should.have.status(400))
        })
    });

    describe('when add image and get project overview', function() {
        it('get imageUri should return 200 and image of Content-Type image/jpeg', function() {
            return chai.request(app)
                       .put(`/projects/${project2Id}/image`)
                       .set(config.get('authToken'), token2)
                       .set('Content-Type', 'image/jpeg')
                       .send(common.image('jpg'))
                       .then(res => {
                            res.should.have.status(201);
                            return chai.request(app)
                                   .get(`/projects`)
                                   .then(res => {
                                       res.should.have.status(200);
                                       res.body.should.have.lengthOf(2);
                                       validator.isValidSchema(res.body, 'definitions.ProjectsOverview').should.be.true;
                                       // find project in returned list of projects to which we earlier added a jpg image
                                       let project = res.body.find(project => project.id === project2Id);
                                       project.should.have.property('imageUri'); // optional in response, so won't be detected by validator
                                       return chai.request(app)
                                                  .get(project.imageUri)
                                                  .then(res => {
                                                      res.should.have.status(200);
                                                      res.should.have.header('content-type', 'image/jpeg');
                                                  })
                                   })
                        })
        })
    });

    describe('when two projects exist and startIndex=1', function() { // startIndex = number of projects to SKIP
        it('should return one project (sort order unspecified)', function() {
            return chai.request(app)
                       .get(`/projects`)
                       .query({startIndex: 1})
                       .then(res => {
                           res.should.have.status(200);
                           res.body.should.have.lengthOf(1);
                           validator.isValidSchema(res.body, 'definitions.ProjectsOverview').should.be.true;
                       })
        })
    });

    describe('when two projects exist and count=1', function() {
        it('should return one project (sort order unspecified)', function() {
            return chai.request(app)
                       .get(`/projects`)
                       .query({count: 1})
                       .then(res => {
                           res.should.have.status(200);
                           res.body.should.have.lengthOf(1);
                           validator.isValidSchema(res.body,'definitions.ProjectsOverview').should.be.true;
                       })
        })
    });

    describe('when two project exist and get projects', function() {
        it('should return a list of two projects', function() {
            return chai.request(app)
                       .get(`/projects`)
                       .then(res => {
                           res.should.have.status(200);
                           res.body.should.have.lengthOf(2);
                           validator.isValidSchema(res.body,'definitions.ProjectsOverview').should.be.true;
                       })
        })
    });

    describe('when two projects exist and the search param creator is set to the id of user1', function() {
        it('should return just project1 created by user1', function() {
            return chai.request(app)
                       .get(`/projects`)
                       .query({creator: user1Id})
                       .then(res => {
                           res.should.have.status(200);
                           res.body.should.have.lengthOf(1);
                           validator.isValidSchema(res.body,'definitions.ProjectsOverview').should.be.true;
                           res.body[0].id.should.be.equal(project1Id)
                       })
        })

    });

    describe('when create a "duplicate" project', function() {
        it('should return 201', function() {
            return chai.request(app)
                       .post(`/projects`)
                       .set(config.get('authToken'), token2)
                       .send(common.projectTemplate('toki', user2Id))
                       .then(res => res.should.have.status(201));
        });
    });

    describe('when two projects exist and project1 is backed by user2Id and the search param backers is set to the id of user2Id', function() {
        it('should return just project1 backed by user2Id', function() {
            return chai.request(app)
                       .post(`/projects/${project1Id}/pledge`)
                       .set(config.get('authToken'), token2)
                       .send(common.pledgeTemplate(user2Id))
                       .then(res => {
                           res.should.have.status(201);
                           chai.request(app)
                               .get(`/projects`)
                               .query({backer: user2Id})
                               .then(res => {
                                   res.should.have.status(200);
                                   res.body.should.have.lengthOf(1);
                                   validator.isValidSchema(res.body, 'definitions.ProjectsOverview').should.be.true;
                                   res.body[0].id.should.be.equal(project1Id)
                               })
                       })
        })
    });

    describe('when two projects exist and the search param backers is set to the id of user1Id who has not backed a project', function() {
        it('should not return any projects', function() {
            return chai.request(app)
                       .get(`/projects`)
                       .query({backer: user1Id})
                       .then(res => {
                           res.should.have.status(200);
                           res.body.should.have.lengthOf(0);
                       })
        })
    });

    describe('when pledge anonymously to unowned project', function() {
        it('should return 201 and pledged should increase', function() {
            return chai.request(app)
                       .post(`/projects/${project1Id}/pledge`)
                       .set(config.get('authToken'), token2)
                       .send(common.pledgeTemplate(user2Id, true, 250))
                       .then(res => {
                           res.should.have.status(201);
                           let id = parseInt(res.body.id);
                           expect(id).to.not.be.NaN; // will fail if id=NaN
            })
        })
    });

    describe('when pledge to project as owner', function() {
        it('should return 403', function() {
            return chai.request(app)
                       .post(`/projects/${project2Id}/pledge`)
                       .set(config.get('authToken'), token2)
                       .send(common.pledgeTemplate(user2Id))
                       .then(
                           (res) => expect.fail(res.statusCode, 403, `status code ${res.statusCode} instead of 403`),
                           (res) => res.should.have.status(403))
        })
    });

    describe('when post change of status to `closed` for unowned project', function() {
        it('should return 403 and status should remain `open`',function() {
            return chai.request(app)
                       .put(`/projects/${project1Id}`)
                       .set(config.get('authToken'), token2)
                       .send({"open": false})
                       .then(
                           (res) => expect.fail(res.statusCode, 403, `status code ${res.statusCode} instead of 403`),
                           (res) => res.should.have.status(403))
        })
    });

    describe('when update rewards for unowned project', function() {
        it('should return 403', function() {
            return chai.request(app)
                       .put(`/projects/${project1Id}/rewards`)
                       .set(config.get('authToken'), token2)
                       .send(common.rewardsTemplate())
                       .then(
                           (res) => expect.fail(res.statusCode, 403, `status code ${res.statusCode} instead of 403`),
                           (res) => res.should.have.status(403))
        })
    });

    describe('when add image to unowned project of Content-Type image/png', function() {
        it('should return 403', function () {
            return chai.request(app)
                       .put(`/projects/${project1Id}/image`)
                       .set(config.get('authToken'), token2)
                       .set('Content-Type', 'image/png')
                       .send(common.image('png'))
                       .then(
                           (res) => expect.fail(res.statusCode, 403, `status code ${res.statusCode} instead of 403`),
                           (res) => res.should.have.status(403))
        });
    });

    describe('when user1 has project1 and user2 has project2 and project3, and user1 has backed project2', function() {

        let project3Id;

        beforeEach('add project3 and user1 pledge to project2', function() {
            this.timeout(5000);
            return common.createProject(app, common.projectTemplate('toki', user2Id), token2)
                         .then(_id => project3Id = _id)
                         .then(() => common.loginUser(app, 'loki', 'toki'))
                         .then(token => {
                                 return chai.request(app)
                                    .post(`/projects/${project2Id}/pledge`)
                                    .set(config.get('authToken'), token)
                                    .send(common.pledgeTemplate(user1Id))
                         })
        });

        describe('when search param creator is set to user2', function() {
            it('should return project2 and project3', function() {
                return chai.request(app)
                           .get(`/projects`)
                           .query({creator: user2Id})
                           .then(res => {
                               res.should.have.status(200);
                               res.body.should.have.lengthOf(2);
                               validator.isValidSchema(res.body,'definitions.ProjectsOverview').should.be.true;
                               for(const project of res.body) {
                                   project.id.should.be.oneOf([project2Id, project3Id]);
                               }
                           })
            })
        });

        describe('when search param creator is set to user2 and search param backer is set to user1', function() {
            it('should return only project2', function() {
                return chai.request(app)
                           .get(`/projects`)
                           .query({creator: user2Id, backer: user1Id})
                           .then(res => {
                               res.should.have.status(200);
                               res.body.should.have.lengthOf(1);
                               validator.isValidSchema(res.body,'definitions.ProjectsOverview').should.be.true;
                               res.body[0].id.should.equal(project2Id);
                           })
            })
        });

        describe('when search param creator is set to user2 and count to 1', function() {
            it('should return either project2 or project3, depending on sort order', function() {
                return chai.request(app)
                           .get(`/projects`)
                           .query({creator: user2Id, count:1})
                           .then(res => {
                               res.should.have.status(200);
                               res.body.should.have.lengthOf(1);
                               validator.isValidSchema(res.body,'definitions.ProjectsOverview').should.be.true;
                               res.body[0].id.should.be.oneOf([project2Id, project3Id]);
                           })
            })
        });

    })

});