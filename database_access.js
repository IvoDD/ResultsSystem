var exports = module.exports;

var mysql = require('mysql');


class Competitor{
    constructor(id, name){
        this.id = id;
        this.name = name;
        this.p = [];
    }
}

exports.Competitor = Competitor;

exports.loadResults = function(connection, comp){
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

exports.changeResult = function(connection, id, problem, value, admin){
    connection.query("UPDATE results SET result = ? WHERE cid = ? AND pid = ?", [value, id, problem], function(err){
        if (err){console.log(err);}
    });
}