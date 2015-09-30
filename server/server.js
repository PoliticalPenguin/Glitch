var express = require('express');
var https = require('https');
var parser = require('body-parser');
var moment = require('moment');
var fs = require('fs');

var youtubeKey = require(__dirname + '/config.js').youtubeKey; //Insert API key from Slack private room

//Initializes Express server to serve static files
var app = express();
module.exports.app = app;

app.set("port", 3000);

app.use(parser.json());

app.use(express.static(__dirname + '/../Client'));

app.listen(app.get("port"));
console.log("Express server listening on ", app.get("port"));

//Initializes io socket server
var ioPort = 1337;
var io = require('socket.io')(ioPort);
console.log("Socket.io server listening on " + ioPort);

var activeSockets = [];
var numActiveClients = 0;

//Read playlist file, parses playlist into an array and run server with the playlist array
fs.readFile(__dirname + '/playlist.json', function read(err, data) {
    if (err) {
        throw err;
    }
    var playlist = JSON.parse(data);
    runServer(playlist);
});


var addToPlayList = function (queryString) {
  // Fetches only the IDs of the videos we are searching for
  
  var requestString = 'https://www.googleapis.com/youtube/v3/search?part=id&fields=items/id/videoId&type=video&videoEmbeddable=true&videoDuration=short&maxResults=5&q='+ queryString + '&key=' + youtubeKey;
  https.get(requestString, function(res) {
    var body = '';
    res.on('data', function(chunk) {
      body += chunk;
    });
    res.on('end', function() {
      var object = JSON.parse(body);
      // Returns an array of video IDs and URLs as our playlist
      var playlist = object.items.map(function(item) {
        return 'https://www.youtube.com/watch?v=' + item.id.videoId;
      });
      console.log('the playlist: ', playlist);

      
    });
  }).on('error', function(err) {
    
  }); 
 
};

var currentSong = module.exports.currentSong = {startMoment: null, endMoment: null, title: null};

var runServer = function(playlist) {
  var currentPlaylist = playlist; //Creates a copy of the playlist; entries will be deleted from this copy as they are played
  
  //Object which represents the current song being played; stores song title, start moment at which server told clients to first play the song, and end moment at which playback should end  
  var donePlaying = true; 
    
  io.on('connection', function(socket) {
    activeSockets.push(socket);
    console.log("Connection established");
    numActiveClients++;

    //This if statement stops the server from emitting a "play" message to the clients before the video data has been retrieved via Youtube API
    if(currentSong.startMoment !== null)
       //The 'time' property is the number of milliseconds that the client should skip ahead when it plays the Youtube video
      socket.emit('play', {url: currentPlaylist[0], title: currentSong.title, time: moment().diff(currentSong.startMoment)});

    socket.on('disconnect', function(socket) {
      var sockIdx = activeSockets.indexOf(socket);
      activeSockets.splice(sockIdx, 1);
      numActiveClients--;
    });

    //chat socket
    socket.on('chat message', function(msg){
      console.log('message: ' + msg);
      io.emit('chat message', msg);
    });
  });

  if(playlist.length > 0) {
    setInterval(function() {
      if(moment().isAfter(currentSong.endMoment)) {  //If the current time is after the endTime for the current entry being played
        donePlaying = true;
        currentPlaylist.shift();  //Deletes an entry from the playlist after it is done playing
      }

      //Plays the first element from the playlist if the current song is done playing and the playlist is not empty
      if(donePlaying && currentPlaylist.length > 0) {
        play(currentPlaylist[0]); //Updates the currentSong object with the first song in the playlist
        donePlaying = false;
      }                                      
    }, 1000);
  }
};

var play = function(playlistEntry) {
  var parsedEntry = playlistEntry.split('=');
  
  var requestString = 'https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=' + parsedEntry[1] + '&key=' + youtubeKey; 

  https.get(requestString, function(res) {
    var body = '';
    res.on('data', function(chunk) {
      body += chunk;
    });
    res.on('end', function() {
      var object = JSON.parse(body);
      var contentDetails = object.items[0].contentDetails;
      var snippet = object.items[0].snippet;
      
      var videoDuration = moment.duration(contentDetails.duration);

      var end = moment();
      end.add(videoDuration);

      var newSong = {};
      newSong.title = snippet.title;
      newSong.startMoment = moment();
      newSong.endMoment = end;
      console.log(newSong.title + ' is now playing.  Video will end ' + newSong.endMoment.calendar());
      currentSong = newSong;
      io.emit('play', {url: playlistEntry, title: currentSong.title, time: 0});
    });
  }).on('error', function(e) {
    console.log("Got error: " + e.message);
  }); 
};

//The exported functions below are currently used for testing;  they can be safely deleted (or removed from export) at deployment

module.exports.getCurrentSong = function () {
  return currentSong;
}

module.exports.getConnectionInfo = function () {
  return {clientSockets: activeSockets, numClients: numActiveClients};
}

module.exports.setTimeLeft = function (millisecondsBeforeEnd) {
  currentSong.endMoment = moment().add(millisecondsBeforeEnd, 'ms');
  console.log('The end time for the current song has been modified to end ' + currentSong.endMoment.calendar());
}
