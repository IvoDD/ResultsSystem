var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var xlsx = require('xlsx');
var mysql = require('mysql');
const Emmiter = require('events');

class MyEmmiter extends Emmiter {}

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'jjkofajj'
});

const dbName = "maths_results";

class Competiton{
    constructor(name, problems, port, sheet){
        this.name = name;
        this.problems = problems;
        this.port = port;
        this.sheet = sheet;
    }
};
var competitions = [new Competiton('5 клас', 6, 3005, 'grade5'),
                   new Competiton('6 клас', 6, 3006, 'grade6'),
                   new Competiton('7 клас', 6, 3007, 'grade7'),
                   new Competiton('8 клас', 6, 3008, 'grade8'),
                   new Competiton('9 клас', 6, 3009, 'grade9'),
                   new Competiton('10-12 клас', 6, 3010, 'grade10')];

var competitors = xlsx.readFile('competitors3.xlsx');
/*var problems = xlsx.readFile('problems.xlsx');*/

connection.connect();

connection.query("SHOW DATABASES LIKE ?", dbName, function(err, rows, fields){
    //console.log(rows);
    if (rows.length == 0){
        console.log("database not existing, creating it...");
        createDB(function(){
            console.log("database created successfully");
            for (let i=0; i<competitions.length; ++i){
                connection.query("INSERT INTO competitions (name, port) VALUES (?, ?)", [competitions[i].name, competitions[i].port], () => {
                    for (let j=0; j<competitions[i].problems; ++j){
                        connection.query("INSERT INTO problems (number, competition_id, link) VALUES (?, ?, ?)", [j+1, i+1, '#']);
                    }
                    let curr = competitors.Sheets[competitions[i].sheet];
                    if (curr != undefined){
                        for (let j=1; curr["A"+j] != undefined && curr["B"+j]!=undefined; ++j){
                            connection.query("INSERT INTO competitors (name, grade, competition_id) VALUES (?, ?, ?)", [curr['A'+j].v, curr['B'+j].v, i+1]);
                        }
                    }
                });
            }
            startServer();
        });
    }
    else{
        console.log("database existing, starting server for admin input");
        connection.changeUser({database: dbName});
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
        current = new Admin(connection, req.body.username, req.body.password, 1, function(success){
            if (success){res.send("Success");}
            else{res.send("Username taken");}
        });
    });
    
    var Admin = require('./Admin.js').Admin;
    
    http.listen(4000, function(){
        console.log("admin signup started on: 127.0.0.1:4000"); 
    });
}

function createDB(callback){
    let myEmmiter = new MyEmmiter(), queriesCompleted = 0;
    
    connection.query('CREATE DATABASE ' + dbName + ';', function(err){
        if (err){throw err;}
        connection.changeUser({database: dbName});
        
        connection.query('CREATE TABLE admins (id int NOT NULL AUTO_INCREMENT, username varchar(255), salted_hash varchar(255), salt varchar(255), PRIMARY KEY(id), UNIQUE KEY (username));', function(err){
            if (err){throw err;}
            myEmmiter.emit('done');
        });
        
        connection.query('CREATE TABLE competitions (id int NOT NULL AUTO_INCREMENT, name varchar(255), port int, PRIMARY KEY(id), UNIQUE KEY(name), UNIQUE KEY(port))', function(err){
            if (err){throw err;}
            
            connection.query('CREATE TABLE competitors (id int NOT NULL AUTO_INCREMENT, name varchar(255), grade int, competition_id int NOT NULL, PRIMARY KEY (id), UNIQUE KEY (name), FOREIGN KEY (competition_id) REFERENCES competitions(id))', function(err){
                if (err){throw err;}
                myEmmiter.emit('done');
            });
            
            connection.query('CREATE TABLE problems (id int NOT NULL AUTO_INCREMENT, number int, competition_id int NOT NULL, link varchar(255), PRIMARY KEY (id), FOREIGN KEY (competition_id) REFERENCES competitions(id))', function(err){
                if (err){throw err;}
                myEmmiter.emit('done');
            });
        });
    });
    
    myEmmiter.on('done', function(){
        ++queriesCompleted;
        if (queriesCompleted == 3){
            
            connection.query('CREATE TABLE results (admin_id int NOT NULL, competitor_id int NOT NULL, problem_id int NOT NULL, result int, time TIMESTAMP, FOREIGN KEY (admin_id) REFERENCES admins(id), FOREIGN KEY (competitor_id) REFERENCES competitors(id), FOREIGN KEY (problem_id) REFERENCES problems(id))', function(err){
                if (err){throw err;}
                callback();
            });
        }
    });
}
/**
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
        if (err){throw err;}
        
        connAdmins.changeUser({database: dbAdmins});
    
        connAdmins.query("CREATE TABLE users (id int NOT NULL AUTO_INCREMENT, username varchar(255), salted_hash varchar(255), salt varchar(255), PRIMARY KEY(id), UNIQUE KEY (username));", function(err){
            if (err){throw err;}
            callback(null);
        });
    });
}
*/