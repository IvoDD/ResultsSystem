var exports = module.exports = {};

var bodyParser = require("body-parser");

exports.handleGets = function(express, app){
    
    app.use(bodyParser.urlencoded({
        extended: true
    }));

    app.use(bodyParser.json());
    
    //app.use('/api', api); // redirect API calls
    //app.use('/', express.static(__dirname + '/www')); // redirect root
    app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js')); // redirect bootstrap JS
    app.use('/js', express.static(__dirname + '/node_modules/jquery/dist')); // redirect JS jQuery
    app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css')); // redirect CSS bootstrap
    
    var path = __dirname + '/views';

    /*app.get('/', function(req, res){
        res.sendFile(path + "/index.html");
    });*/

    app.get('/template.css', function(req, res){
        res.sendFile(path + "/template.css");
    });
    app.get('/login.css', function(req, res){
        res.sendFile(path + "/login.css");
    });
    
    app.get('/view.js', function(req, res){
        res.sendFile(path + "/view.js");
    });
    
    app.get('/connection.js', function(req, res){
        res.sendFile(path + "/connection.js");
    });
    
    app.get('/*.png', function(req, res){
        res.sendFile(path + req.url);
    });
}