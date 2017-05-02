var mysql = require('mysql');

var gets = require('./get_handler.js');
var database = require('./database_access.js');
var Admin = require('./Admin.js').Admin;

var db_config = {
    host: 'localhost',
    user: 'root',
    password: 'jjkofajj',
    database: 'maths_results'
};
//var connection = mysql.createConnection(db_config);
//connection.connect();

var connection;
var competitions = [];

function handleDisconnect() {
  connection = mysql.createConnection(db_config);

  connection.connect(function(err) {
    if(err) {
      //console.log('error when connecting to db:', err);
      setTimeout(handleDisconnect, 2000);
    }
  });

  connection.on('error', function(err) {
    //console.log('db error', err);
    setTimeout(handleDisconnect, 2000); 
  });
}

handleDisconnect();

/*connection.on('error', () => {
    setTimeout(() => {connection=mysql.createConnection(db_config);connection.connect();})
});*/

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
        
        socket.on('addCompetitor', function(name, grade){
            if (!valid){return;}
            database.addCompetitor(connection, name, grade, competitions[i].id, (id) => {
                competitions[i].comp[id] = new database.Competitor(id, name);
                socket.emit('newCompetitor', competitions[i].comp[id]);
            });
        });
    });

    http.listen(competitions[i].port, function(){
        console.log("server started on port " + competitions[i].port);
    });
}

});