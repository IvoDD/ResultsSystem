var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var gets = require('./get_handler.js');
var database = require('./database_access.js');

gets.handleGets(express, app);

var comp = [];
database.loadResults(comp);

io.on('connection', function(socket){
    //console.log("connection");
    socket.emit('init', comp);
});

http.listen(3000, function(){
    console.log("server started");
});