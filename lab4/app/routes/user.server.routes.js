/**
 * Created by ldu32 on 16/08/17.
 */
const users = require('../controllers/user.server.controller');

module.exports = function(app){
    app.route('/api/users')
        .get(users.list)
        .post(users.create);

    app.route('/api/users/:userID')
        .get(users.read)
        .put(users.update)
        .delete(users.delete);
};