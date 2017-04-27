var mysql = require('mysql');

var gets = require('./get_handler.js');
var database = require('./database_access.js');
var Admin = require('./Admin.js').Admin;

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'jjkofajj',
    database: 'maths_results'
});

connection.connect();
var competitions = [];
database.loadCompetitions(connection, competitions, () => {

database.loadResults(connection, competitions);
for (let i=0; i<competitions.length; ++i){
    let express = require('express');
    let app = express();
    let http = require('http').Server(app);
    let io = require('socket.io')(http);

    gets.handleGets(express, app);

    app.get('/', function(req, res){
        res.sendFile(__dirname + "/views/index.html");
    });

    //database.loadResults(connection, comp);

    io.on('connection', function(socket){
        let currentUser, valid = 0, admin_id = -1;
        socket.emit('init', competitions[i].name, competitions[i].comp, competitions[i].prob);

        socket.on('login', function (user){
            currentUser = new Admin(connection, user.username, user.password, 0, function (success, id){
                socket.emit('login', success);
                valid = success;
                if (success){admin_id = id;}
                else{admin_id = -1;}
            });
        });

        socket.on('updateResult', function(id, problem, value){
            if (!valid){return;}
            competitions[i].comp[id].p[problem]=value;
            io.emit('changeResult', competitions[i].comp[id]);
            database.changeResult(connection, admin_id, id, competitions[i].prob[problem], value);
        });
    });

    http.listen(competitions[i].port, function(){
        console.log("server started on port " + competitions[i].port);
    });
}

});