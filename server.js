var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var mysql = require('mysql');

var gets = require('./get_handler.js');
var database = require('./database_access.js');
var Admin = require('./Admin.js').Admin;

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'jjkofajj',
    database: 'cake_results_test'
});
var connAdmins = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'jjkofajj',
    database: 'admins'
});

gets.handleGets(express, app);

app.get('/', function(req, res){
    res.sendFile(__dirname + "/views/index.html");
});

connection.connect();
var comp = [];
database.loadResults(connection, comp);

io.on('connection', function(socket){
    let currentUser, valid = 0;
    socket.emit('init', comp);
    
    socket.on('login', function (user){
        currentUser = new Admin(connAdmins, user.username, user.password, 0, function (success){
            socket.emit('login', success);
            valid = success;
        });
    });
    
    socket.on('updateResult', function(id, problem, value){
        if (!valid){return;}
        comp[id].p[problem]=value;
        io.emit('changeResult', comp[id])
        database.changeResult(connection, id, problem, value, currentUser);
    })
});

http.listen(3000, function(){
    console.log("server started");
});