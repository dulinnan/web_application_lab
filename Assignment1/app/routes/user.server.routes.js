/**userByIdCREATE TABLE `public_user` (
  `id` int(11) NOT NULL,
  `username` varchar(45) DEFAULT NULL,
  `location` varchar(45) DEFAULT NULL,
  `email` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `user_id_ref_public` FOREIGN KEY (`id`) REFERENCES `Users` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='basic info about Users';
 * Created by ldu32 on 16/08/17.
 */
const users = require('../controllers/user.server.controller');

module.exports = function(app){
    app.route('/users/:id')
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
