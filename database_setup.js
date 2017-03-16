var xlsx = require('xlsx');
var mysql = require('mysql');
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'jjkofajj'
});

var dbName = "cake_results_test";

var competitors = xlsx.readFile('competitors.xlsx');
var problems = xlsx.readFile('problems.xlsx');

/*for (let i=1; competitors.Sheets.Sheet1["A"+i]!=undefined; ++i){
    console.log(competitors.Sheets.Sheet1["A"+i].v, competitors.Sheets.Sheet1["B"+i].v);
}*/
connection.connect();

setupDB();

/*connection.query("INSERT INTO users (username, password) VALUES ('IvoD', 'asdf')", function (err, rows, fields) {
    if (err) throw err;
    console.log("insert successful");
});*/

connection.end();

function setupDB(){
    connection.query("CREATE DATABASE " + dbName, function(err){
        if(err){console.log(err);}
    });
    connection.changeUser({database: dbName});
    
    connection.query("CREATE TABLE competitors (id int NOT NULL AUTO_INCREMENT, name varchar(255), grade int, PRIMARY KEY(id), UNIQUE KEY (name));");
    
    for (let i=1; competitors.Sheets.Sheet1["A"+i] != undefined; ++i){
        connection.query("INSERT INTO competitors (name, grade) VALUES ('" + 
                         competitors.Sheets.Sheet1["A"+i].v + "', '" +
                         competitors.Sheets.Sheet1["B"+i].v + "');");
        //console.log(competitors.Sheets.Sheet1["A"+i].v);
    }
    
    connection.query("CREATE TABLE problems (id int NOT NULL AUTO_INCREMENT, link VARCHAR(255), PRIMARY KEY (id));");
    
    for (let i=1; problems.Sheets.Sheet1["A"+i] != undefined; ++i){
        connection.query("INSERT INTO problems (link) VALUES ('" +
                         problems.Sheets.Sheet1["A"+i].v + "');");
    }
    
    connection.query("CREATE TABLE results (cid int NOT NULL, pid int NOT NULL, result DOUBLE, FOREIGN KEY (cid) REFERENCES competitors(id), FOREIGN KEY (pid) REFERENCES problems(id));");
}