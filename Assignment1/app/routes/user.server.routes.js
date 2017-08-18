/**userById
 * Created by ldu32 on 16/08/17.
 */
const users = require('../controllers/user.server.controller');

module.exports = function(app){
    app.route('/users/{id}')
        .get(users.list)
        .put(users.update)
        .delete(users.delete);

    app.route('/users')
        .post(users.create);

    app.route('/users/login')
        .post(users.login);

    app.route('/users/logout')
        .post(users.logout);
};