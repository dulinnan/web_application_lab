/**
 * Created by ldu32 on 16/08/17.
 */
const express = require('express'),
    bodyParser = require('body-parser');

module.exports = function(){
    const app = express();
    app.use(bodyParser.json());


    require('../app/routes/user.server.routes.js')(app);
    require('../app/routes/reward.server.routes')(app);
    require('../app/routes/project.server.routes')(app);

    return app;
};
