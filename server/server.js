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

var activeSockets = [];
var numActiveClients = 0;

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
  
  //Variables to track the current song being played, its start time, its end time and whether the song is done playing
  var currentSong = null;
 
  var startMoment = null;   
  var endMoment = null;
  var donePlaying = true; 
    
  io.on('connection', function(socket) {
    activeSockets.push(socket);
    console.log("Connection established");
    numActiveClients++;

    //The 'time' property is the number of milliseconds that the client should skip ahead when it plays the Youtube video
    socket.emit('play', {url: currentSong, time: moment().diff(startMoment)})

    // Create listeners on each client socket for song updates
    socket.on('disconnect', function(socket) {
      var sockIdx = activeSockets.indexOf(socket);
      activeSockets.splice(sockIdx, 1);
      numActiveClients--;
    });
  });

  if(playlist.length > 0) {
    setInterval(function() {

      if(moment().isAfter(endMoment)) {  //If the current time is after the endTime for the current entry being played
        donePlaying = true;
        currentPlaylist.shift();  //Deletes an entry from the playlist after it is done playing
      };

      //Plays the first element from the playlist if the current song is done playing and the playlist is not empty
      if(donePlaying && currentPlaylist.length > 0) {
        // endMoment = play(currentPlaylist[0]); //Updates the endTime variable with the end time calculated for a given playlist entry
        
        donePlaying = false;

        currentSong = currentPlaylist[0];
        startMoment = moment();   //Stores the time at which playback was started, in order to calculate the playback start times 
      };                        //for clients that join after a new song has already started

     
    }, 1000);
  }
};

var play = function(playlistEntry, timeToSkip) {
  io.emit('play', {url: playlistEntry, time: timeToSkip || 0});
  
  //endtime should be calculated using Youtube API and should be returned in the format of the 'moment' library
  
  var songDuration = {h: 0, m: 0, s: 0};  //This is a template of how the server expects to see song duration info from Youtube; format data from Youtube API to follow this format 

  var end = moment();
  // endMoment().add(songDuration.h, 'hours').add(songDuration.m, 'minutes').add(songDuration.s, 'seconds'); //This is alternative syntax in case the chaining below does not work
  return end.add(songDuration.h, 'hours').minutes(songDuration.m).seconds(songDuration.s);
}; 
