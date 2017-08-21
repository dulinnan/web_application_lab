/**
 * Created by linnandu on 20/08/17.
 */
const rewards = require('../controllers/reward.server.controller');

module.exports = function(app){
    app.route('/projects/:id/rewards')
        .get(rewards.list)
        .put(rewards.update);
};