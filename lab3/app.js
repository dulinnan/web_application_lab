/**
 * Created by ldu32 on 16/08/17.
 */
const mysql = require('mysql');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const uuidV4 = require('uuid/v4');
app.use(bodyParser.json());
const pool = mysql.createPool({
    connectionLimit: 100,
    host: 'localhost',
    port: 6033,
    user: 'seng365',
    password: 'secret',
    database: 'lab3'
});

function get_users(req, res) {
    pool.getConnection(function (err, connection) {
        if (err) {
            consol.log(err);
            res.json({"ERROR":"Error in connection database"});
            return;
        }

        console.log('console as id ' + connection.threadId);

        connection.query("SELECT * FROM Users", function (err, rows) {
            connection.release();
            if(!err) {
                res.json(rows);
            }
        });
        connection.on('error', function (err) {
            res.json({"ERROR":"Error in connection database"});
            return;
        });
    });

}

app.get("/users", function(req, res){
    get_users(req, res);
});

function post_user(req, res, user_data) {
    pool.getConnection(function(err, connection) {
        if (err){
            res.json({"ERROR":"Error in connection database"});
            return;
        }
        console.log('connected as id ' + connection.threadId);

        let user = user_data['username'].toString();
        const sql = "INSERT INTO Users (username) VALUES ?";
        console.log(user);

        let values = [
            [user]
        ];

        connection.query(sql, [values], function(err, result){
            connection.release();
            if(!err) {
                res,json({"SUCCESS":"Successfully inserted user"});
            } else {
                console.log(err);
                res.json({"ERROR":"Error inserting user"});
            }
        });
        connection.on('error', function (err) {
            res.json({"ERROR":"Error in connection database"});
            return;
        });
   });
}

app.post('/users', function(req,res){
    var user_data = {
        "username": req.body.username
    };

    post_user(req, res, user_data);
});

function get_conversations(req, res) {
    pool.getConnection(function (err, connection) {
        if (err) {
            consol.log(err);
            res.json({"ERROR":"Error in connection database"});
            return;
        }

        console.log('console as id ' + connection.threadId);

        connection.query("SELECT * FROM Conversations", function (err, rows) {
            connection.release();
            if(!err) {
                res.json(rows);
            }
        });
        connection.on('error', function (err) {
            res.json({"ERROR":"Error in connection database"});
            return;
        });
    });

}

app.get("/conversations", function(req, res){
    get_conversations(req, res);
});

function list_conversation(req, res, id) {
    pool.getConnection(function (err, connection) {
        if (err) {
            console.log(err);
            res.json({"ERROR":"Error in connection database"});
            return;
        }
        console.log(id);

        console.log('console as id ' + connection.threadId);

        const sql = "SELECT * FROM Conversations WHERE convo_id= ?";
        connection.query(sql, id, function (err, rows) {
            connection.release();
            if(!err) {
                res.json(rows);
            }
        });
        connection.on('error', function (err) {
            res.json({"ERROR":"Error in connection database"});
            return;
        });
    });

}

app.get("/conversations/:id", function(req, res){
    let id = req.params.id;
    list_conversation(req, res, id);
});

function listSingleMsg(req, res, convo_id, message_id) {
    pool.getConnection(function (err, connection) {
        if (err) {
            console.log(err);
            res.json({"ERROR":"Error in connection database"});
            return;
        }
        // console.log(convo_id);

        console.log('console as id ' + connection.threadId);
        console.log(message_id);
        const sql = "SELECT * FROM Messages WHERE convo_id= ? AND message_id= ?";
        connection.query(sql, [convo_id, message_id], function (err, rows) {
            connection.release();
            if(!err) {
                res.json(rows);
            } else {
                res.json(err);
            }
        });
        connection.on('error', function (err) {
            res.json({"ERROR":"Error in connection database"});
            return;
        });
    });

}

app.get("/conversations/:cid/messages/:mid", function(req, res){
    let convo_id = req.params.cid;
    let message_id = req.params.mid;
    listSingleMsg(req, res, convo_id, message_id);
});

app.listen(3000, function () {
    console.log("Example app listening on port 3000");
})