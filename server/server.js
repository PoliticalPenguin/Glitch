var express = require('express');
// var http = require('http');
var parser = require('body-parser');
var moment = require('moment');
var fs = require('fs');

//Initializes Express server to serve static files
var app = express();
module.exports.app = app;

app.set("port", 3000);

app.use(parser.json());

app.use(express.static(__dirname + '/../client'));

app.listen(app.get("port"));
console.log("Express server listening on ", app.get("port"));

//Initializes io socket server

// server = http.createServer();
// var io = require('socket.io')(server);
// var ioPort = 1337;

// server.listen(ioPort, function(err) {
//   if (err) { console.log(err); }
//   console.log("IO server listening on port " + ioPort);
// });
var ioPort = 1337;
var io = require('socket.io')(ioPort);
console.log("Socket.io server listening on " + ioPort);

//Listens for and initializes client connections
var activeSockets = [];
var numActiveClients = 0;

io.on('connection', function(socket) {
  activeSockets.push(socket);
  isAuthenticated.push(false);
  console.log("Connection established");
  numActiveClients++;

  // Create listeners on each client socket for song updates
  socket.on('disconnect', function(socket) {
    var sockIdx = activeSockets.indexOf(socket);
    activeSockets.splice(sockIdx, 1);
    numActiveClients--;
  });
});

//Read playlist file, parses playlist into an array and run server with the playlist array
fs.readFile('./playlist.json', function read(err, data) {
    if (err) {
        throw err;
    }
    var playlist = JSON.parse(data);
    console.log(playlist);
    runServer(playlist);
});

var runServer = function(playlist) {
  var currentPlaylist = playlist; //Creates a copy of the playlist; entries will be deleted from this copy as they are played
  var donePlaying = true; 

  if(playlist.length > 0) {
    setInterval(function() {
      //Plays the first element from the playlist if the current song is done playing and the playlist is not empty
      if(donePlaying && currentPlaylist.length > 0) {
        endTime = play(currentPlaylist[0]); //Updates the endTime variable with the end time calculated for a given playlist entry
        donePlaying = false;
      };

      if(moment().isAfter(endTime)) {  //If the current time is after the endTime for the current entry being played
        donePlaying = true;
        currentPlaylist.shift();  //Deletes an entry from the playlist after it is done playing
      };
    }, 1000);
  }
};

var play = function(playlistEntry) {
  io.emit('play', {play: playlistEntry});
  //endtime should be calculated using Youtube API and should be returned in the format of the 'moment' library
  //return the endTime
}; 