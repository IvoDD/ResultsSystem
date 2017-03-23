var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var xlsx = require('xlsx');
var mysql = require('mysql');
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'jjkofajj'
});
var connAdmins = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'jjkofajj'
});

const dbName = "cake_results_test", dbAdmins = "admins";

var competitors = xlsx.readFile('competitors.xlsx');
var problems = xlsx.readFile('problems.xlsx');

connection.connect();

connection.query("SHOW DATABASES LIKE '" + dbName + "'", function(err, rows, fields){
    //console.log(rows);
    if (rows.length == 0){
        console.log(dbName + " not existing, creating it...");
        setupDB(function(err){
            if (err){console.log(err);}
            else{console.log("success");}
        });
    }
});

connAdmins.query("SHOW DATABASES LIKE '" + dbAdmins + "'", function(err, rows, fields){
    //console.log(rows);
    if (rows.length == 0){
        console.log(dbAdmins + " not existing, creating it..");
        setupAdmins(function(err){
            if (err){console.log(err);}
            else{
                console.log("success");
                startServer();
            }
        });
    }else{
        startServer();
    }
});

function startServer(){
    var gets = require('./get_handler.js');
    gets.handleGets(express, app);
    
    app.get('/',function(req, res){
        res.sendFile(__dirname + '/views/admins.html');
    });
    
    app.get('/admins.js',function(req, res){
        res.sendFile(__dirname + '/views/admins.js');
    });
    
    app.post('/register', function(req, res){
        let current;
        current = new Admin(connAdmins, req.body.username, req.body.password, 1, function(success){
            if (success){res.send("Success");}
            else{res.send("Username taken");}
        });
    });
    
    var Admin = require('./Admin.js').Admin;
    connAdmins.changeUser({"database": "admins"});
    
    io.on('connection', function(socket){
        let current;
        socket.on('register', function(username, password){
            
        });
        
    });
    
    http.listen(4000, function(){
        console.log("admin signup started on: 127.0.0.1:4000"); 
    });
}

function setupDB(callback){
    connection.query("CREATE DATABASE " + dbName, function(err){
        if (err){throw err;}
        connection.changeUser({database: dbName});

        connection.query("CREATE TABLE competitors (id int NOT NULL AUTO_INCREMENT, name varchar(255), grade int, PRIMARY KEY(id), UNIQUE KEY (name));",
        function(err){
            if (err){throw err;}
            for (let i=1; competitors.Sheets.Sheet1["A"+i] != undefined; ++i){
                connection.query("INSERT INTO competitors (name, grade) VALUES ('" + 
                                 competitors.Sheets.Sheet1["A"+i].v + "', '" +
                                 competitors.Sheets.Sheet1["B"+i].v + "');");
                //console.log(competitors.Sheets.Sheet1["A"+i].v);
            }
        });

        connection.query("CREATE TABLE problems (id int NOT NULL AUTO_INCREMENT, link VARCHAR(255), PRIMARY KEY (id));",
        function(err){    
            if (err){throw err;}
            for (let i=1; problems.Sheets.Sheet1["A"+i] != undefined; ++i){
                connection.query("INSERT INTO problems (link) VALUES ('" +
                                 problems.Sheets.Sheet1["A"+i].v + "');");
            }
        });

        connection.query("CREATE TABLE results (cid int NOT NULL, pid int NOT NULL, result DOUBLE, FOREIGN KEY (cid) REFERENCES competitors(id), FOREIGN KEY (pid) REFERENCES problems(id));",
        function(err){
            if (err){throw err;}
            callback(null);
        });
    });
}

function setupAdmins(callback){
    connAdmins.query("CREATE DATABASE " + dbAdmins, function(err){
        if (err){/*callback(err);*/ throw err;}
        
        connAdmins.changeUser({database: dbAdmins});
    
        connAdmins.query("CREATE TABLE users (id int NOT NULL AUTO_INCREMENT, username varchar(255), salted_hash varchar(255), salt varchar(255), PRIMARY KEY(id), UNIQUE KEY (username));", function(err){
            if (err){throw err;}
            callback(null);
        });
    });
}