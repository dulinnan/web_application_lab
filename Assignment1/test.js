/**
 * Created by ldu32 on 18/08/17.
 */
const db = require('./config/db'),
    express = require('./config/express');
const dbBuild = require('./config/dbBuild');
let user_id = 0;
const app = express();
// Connect to MySQL on start
db.connect(function(err) {
    if (err) {
        console.log('Unable to connect to MySQL.');
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

        app.listen(process.env.PORT, function() {
            console.log('Listening on port: ' + process.env.PORT);
        });
    }
});

