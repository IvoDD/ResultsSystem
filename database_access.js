var exports = module.exports;

var mysql = require('mysql');
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'jjkofajj',
    database: 'cake_results_test'
});

class Competitor{
    constructor(id, name){
        this.id = id;
        this.name = name;
        this.p = [];
    }
}

exports.Competitor = Competitor;

connection.connect();

exports.loadResults = function(comp){
    connection.query("SELECT * FROM competitors", function(err, rows, fields){
        for (let i=0; rows[i]!=undefined; ++i){
            comp[rows[i].id] = new Competitor(rows[i].id, rows[i].name);
        }
    });
    connection.query("SELECT * FROM results", function(err, rows, fields){
        for (let i=0; rows[i]!=undefined; ++i){
            comp[rows[i].cid].p[rows[i].pid-1] = rows[i].result;
        }
    });
}