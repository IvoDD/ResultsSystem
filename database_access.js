var exports = module.exports;

var mysql = require('mysql');


class Competitor{
    constructor(id, name){
        this.id = id;
        this.name = name;
        this.p = [];
    }
}
class Competiton{
    constructor(id, name, port){
        this.id = id;
        this.name = name;
        this.port = port;
        this.comp = [];
        this.prob = [];
    }
}

exports.Competitor = Competitor;

exports.loadCompetitions = function(connection, competitions, callback){
    connection.query("SELECT * FROM competitions", (err, rows, fields) => {
        for (let i=0; rows[i]!=undefined; ++i){
            competitions[i] = new Competiton(rows[i].id, rows[i].name, rows[i].port);
            connection.query("SELECT * FROM competitors WHERE competition_id = ?", rows[i].id, (cerr, crows, cfields) => {
                for (let j=0; crows[j]!=undefined; ++j){
                    competitions[i].comp[crows[j].id] = new Competitor(crows[j].id, crows[j].name);
                }
            });
            connection.query("SELECT * FROM problems WHERE competition_id = ?", rows[i].id, (perr, prows, pfields) => {
                for (let j=0; prows[j]!=undefined; ++j){
                    competitions[i].prob[prows[j].number-1] = prows[j].id;
                }
            });
        }
        callback();
    });
}

exports.loadResults = function(connection, competitions){
    connection.query("SELECT results.competitor_id, results.result, problems.number, problems.competition_id FROM results INNER JOIN problems ON results.problem_id=problems.id ORDER BY results.time", (err, rows, fields) => {
        for (let i=0; rows[i]!=undefined; ++i){
            competitions[rows[i].competition_id-1].comp[rows[i].competitor_id].p[rows[i].number-1] = rows[i].result;
        }
    });
}

exports.changeResult = function(connection, admin_id, competitor_id, problem_id, result){
    connection.query("INSERT INTO results (admin_id, competitor_id, problem_id, result) VALUES (?, ?, ?, ?)", [admin_id, competitor_id, problem_id, result]);
}