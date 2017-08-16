/**
 * Created by ldu32 on 16/08/17.
 */
const db = require('./config/db'),
    express = require('./config/express');
const app = express();
// Connect to MySQL on start
db.connect(function(err) {
    if (err) {
        console.log('Unable to connect to MySQL.');
        process.exit(1);
    } else {
        app.listen(process.env.PORT, function() {
            console.log('Listening on port: ' + process.env.PORT);
        });
    }
});




