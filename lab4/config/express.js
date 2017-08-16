/**
 * Created by ldu32 on 16/08/17.
 */
const express = require('express'),
    bodyParser = require('body-parser');

module.exports = function(){
    const app = express();

    app.use(bodyParser.urlencoded({
        extended: true
    }));

    require('../app/routes/user.server.routes.js')(app);
    return app;
};
