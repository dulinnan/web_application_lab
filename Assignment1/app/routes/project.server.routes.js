/**            // res.sendStatus(200);
 * Created by ldu32 on 21/08/17.
 */
const projects = require('../controllers/project.server.controller');

module.exports = function(app){
    app.route('/projects')
        .get(projects.listAll)
        .post(projects.create);

    app.route('/projects/:id')
        .get(projects.listOne)
        .put(projects.update);

    app.route('/projects/:id/image')
        .get(projects.getImage)
        .put(projects.updateImage);

    app.route('/projects/:id/pledge')
        .post(projects.insertPledge);
};