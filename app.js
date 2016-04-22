var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var connect = require('camo').connect;
var Entry = require('./model/entry');
var app = express();
var uri = 'nedb://./data/iotspede';
var currentScore = 0;
var io = null;

var SerialPort = require('serialport').SerialPort;
var serialPort = new SerialPort('/dev/ttyUSB0', {
  baudrate: 9600
});

serialPort.on('open', function () {
  serialPort.on('data', function (data) {
    var stringData = data.toString('utf-8');
    currentScore = parseInt(stringData, 10);
    if(io){
      io.emit('score:received', {score: currentScore});
    }
  });
});

connect(uri).then(function (db) {
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'jade');

  app.use(express.static(__dirname + '/public'));
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  
  var http = require('http').Server(app);
  io = require('socket.io')(http);

  app.get('/', function (req, res) {
    res.render('index');
  });

  app.post('/start', function (req, res) {
    var team = req.body.team;
    var entry = Entry.create({
      name: team,
      score: currentScore
    });
    entry.save().then(function(){
      currentScore = 0;
      res.send('ok');
    });
  });
  
  app.get('/leaderboard', function(req, res){
    Entry.find({}, {sort: '-score'}).then(function(entries){
      res.render('leader', {entries: entries});
    });
  });

  http.listen(3000, function () {
    console.log('Express server listening on port 3000');
  });
});