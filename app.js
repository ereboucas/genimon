
/**
 * Module dependencies.
 */

var express = require('express')
  , http = require('http')
  , path = require('path')
  , mongo = require('mongodb');

var Server = mongo.Server,
    Db = mongo.Db;

var server = new Server('localhost', 27017, {auto_reconnect: true});
db = new Db('genimon', server, {safe: true});

db.open(function(err, db) {
    if(!err) {
        console.log("Connected to genimon database");
    }
});

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.use(express.favicon(__dirname + '/public/favicon.ico'));
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('mongeni'));
  app.use(express.session());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));

  app.get('/', function(req, res) {
    res.sendfile(path.join(__dirname, 'public', 'index.html'));
  });

  app.get("/cells/:map_name", function(req, res) {
    db.collection('cells', function(err, cells) {
      cells.findOne({map_name: req.params.map_name}, function(err, item) {
        res.send(item.cells);
      });
    });
  });

  app.post("/cells/:map_name", function(req, res) {
    db.collection('cells', function(err, cells) {
      cells.update({map_name: req.params.map_name}, {map_name: req.params.map_name, cells: req.body.cells}, { upsert: true }, function(err, result) {
        console.log("cells saved");
      });
    });
    res.send('ok');
  });

  app.get("/maps/:map_name", function(req, res) {
    res.sendfile(__dirname + '/public/maps/' + req.params.map_name + '/config.json');
  });

  app.post("/maps/:map_name", function(req, res) {
    console.log('post');
  });

});

app.configure('development', function(){
  app.use(express.errorHandler());
});

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
