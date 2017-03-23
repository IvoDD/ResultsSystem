var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var mysql = require('mysql');

var gets = require('./get_handler.js');
var database = require('./database_access.js');

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'jjkofajj',
    database: 'cake_results_test'
});

gets.handleGets(express, app);

app.get('/', function(req, res){
    res.sendFile(__dirname + "/views/index.html");
});

connection.connect();
var comp = [];
database.loadResults(connection, comp);

io.on('connection', function(socket){
    //console.log("connection");
    socket.emit('init', comp);
});

http.listen(3000, function(){
    console.log("server started");
});