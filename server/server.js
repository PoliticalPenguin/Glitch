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

// Program storage variables
var activeSockets = [];
var numActiveClients = 0;
var chatMessages = [];
var lastChatIdx = -1;
var currentPlaylist = [];

// Configuration variables
var chatAnalysisTime = 5000;

//Object which represents the current song being played; stores song title, start moment at which server told clients to first play the song, and end moment at which playback should end  
var currentSong = module.exports.currentSong = {startMoment: null, endMoment: null, title: null};

//starts Server

var startServer = function() {
  setUpSockets();  
  handlePlaylist();
  analyzeChat();
};

var fetchPlaylistFromYouTube = function (queryString, callback) {
  // Fetches only the IDs of the videos we are searching for
  // default maxResults is 5
  var requestString = 'https://www.googleapis.com/youtube/v3/search?part=id&fields=items/id/videoId&type=video&videoEmbeddable=true&videoDuration=short&maxResults=5&q='+ queryString + '&key=' + youtubeKey;
  https.get(requestString, function(res) {
    var body = '';
    res.on('data', function(chunk) {
      body += chunk;
    });
    res.on('end', function() {
      var object = JSON.parse(body);
      // Returns an array of video IDs and URLs as our playlist
      var results = object.items.map(function(item) {
        return 'https://www.youtube.com/watch?v=' + item.id.videoId;
      });
      callback(results);
    });
  }).on('error', function(err) {
    console.log("There was an error fetching the music files from Youtube: ", err);
  }); 
};

var setUpSockets = function () {
  io.on('connection', function(socket) {
    activeSockets.push(socket);
    console.log("Connection established");
    numActiveClients++;

    //This if statement stops the server from emitting a "play" message to the clients before the video data has been retrieved via Youtube API
    if(currentSong.startMoment !== null)
       //The 'time' property is the number of milliseconds that the client should skip ahead when it plays the Youtube video
      socket.emit('play', {url: currentSong.url, title: currentSong.title, time: moment().diff(currentSong.startMoment)});

    socket.on('disconnect', function(socket) {
      var sockIdx = activeSockets.indexOf(socket);
      activeSockets.splice(sockIdx, 1);
      numActiveClients--;
    });

    //chat socket
    socket.on('chat message', function(msg){
      console.log('message: ' + msg);
      chatMessages.push(msg);
      io.emit('chat message', msg);
    });

    // Echo messages back to client (for use in debugging & testing)
    socket.on('echo', function(obj) {
      socket.emit(obj.name, obj.data);
    });
  });
  console.log('sockets established...');
};


var handlePlaylist = function () {
  var donePlaying = true;
  
  setInterval(function() {
    if(donePlaying && currentPlaylist.length > 0) {
      playSong(currentPlaylist[0]); //Updates the currentSong object with the first song in the playlist
      donePlaying = false;
      currentSong = currentPlaylist[0];
      // console.log(donePlaying);
    }         

    
    if(moment().isAfter(currentSong.endMoment)) {  //If the current time is after the endTime for the current entry being played
      donePlaying = true;
      currentPlaylist.shift();  //Deletes an entry from the playlist after it is done playing
      // console.log(currentPlaylist);
      // console.log(donePlaying);
    }

    //Plays the first element from the playlist if the current song is done playing and the playlist is not empty
  }, 1000);
};


function analyzeChat() {
  setInterval(function() {
    var bangs = [];
    for (var i = lastChatIdx+1; i < chatMessages.length; i++) {
      var chatMessage = chatMessages[i];
      if (chatMessage.charAt(0) === "!") {
        bangs.push(chatMessage.substr(1));
      }
      lastChatIdx = i;
    }

    // For each bang, use the Youtube Search API
    for (var j = 0; j < bangs.length; j++) {
      fetchPlaylistFromYouTube(bangs[j], function(results) {
        // Add the top result to our playlist
        currentPlaylist.push(results[0]);
        // console.log(currentPlaylist);
      });
    }
  }, chatAnalysisTime);
}

var playSong = function(playlistEntry) {
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
      newSong.id = parsedEntry[1];
      newSong.url = playlistEntry;
      newSong.title = snippet.title;
      newSong.startMoment = moment();
      newSong.endMoment = end;
      console.log(newSong.title + ' is now playing.  Video will end ' + newSong.endMoment.calendar());
      currentSong = newSong;
      io.emit('play', {url: newSong.url, title: currentSong.title, time: 0});
    });
  }).on('error', function(e) {
    console.log("Got error: " + e.message);
  }); 
};


// Start running the server

startServer();


//The exported functions below are currently used for testing;  they can be safely deleted (or removed from export) at deployment

module.exports.getCurrentSong = function () {
  return currentSong;
};

module.exports.getConnectionInfo = function () {
  return {clientSockets: activeSockets, numClients: numActiveClients};
};

module.exports.setTimeLeft = function (millisecondsBeforeEnd) {
  currentSong.endMoment = moment().add(millisecondsBeforeEnd, 'ms');
  console.log('The end time for the current song has been modified to end ' + currentSong.endMoment.calendar());
};
