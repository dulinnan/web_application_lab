/**
 * Created by ldu32 on 18/08/17.
 */
const db = require('./config/db'),
    express = require('./config/express');
const dbBuild = require('./config/dbBuild');
const app = express();
// const process.env.PORT = 3000;
// Connect to MySQL on start
db.connect(function(err) {
    if (err) {
        console.log('Unable to connect to MySQL.');
        setTimeout(function() {
            db.connect();
        }, 3000);
        process.exit(1);
    } else {
        dbBuild.createUser();
        dbBuild.createPublicUser();
        dbBuild.createProject();
        dbBuild.createProjectData();
        dbBuild.createRewardTale();
        dbBuild.createPledgeTable();
        dbBuild.createProgress();
        dbBuild.createBackerTable();
        dbBuild.createCreatorTable();
        dbBuild.createLoginResponse();

        app.listen(3000, function() {
            console.log('Listening on port: ' + 3000);
        });
    }
});

