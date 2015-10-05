/*  Glitch server, which uses HTTP (Express) to serve static files and sockets (Socket.io) to handle all chat messages
and event messages between clients and server. */

var express = require('express');
var https = require('https');
var parser = require('body-parser');
var moment = require('moment');
var fs = require('fs');

module.exports.youtubeKey = process.env['YOUTUBE_KEY'] || require(__dirname + '/config.js').youtubeKey; //Insert API key from Slack private room

//Initializes Express server to serve static files
var app = express();
// module.exports.app = app;
var server = require('http').createServer(app);

app.use(parser.json());
app.use(express.static(__dirname + '/../Client'));

server.listen(process.env.PORT || 1337);

module.exports.server = server;

console.log("Express server listening");

// Program storage variables
var chatMessages = [];
var currentPlaylist = [];
var lastVideoInPlaylist = {};

// Configuration variables
module.exports.emptyChatAnalysisTime = 250;
module.exports.fullChatAnalysisTime = 10000;
module.exports.playlistAnalysisTime = 1000;
module.exports.youtubeResults = 5;
module.exports.bangRatios = {
  next: .5
};

// Import all modules with our server functionality
var socketHandler = require(__dirname + '/app/socketHandler.js');
var playlistHandler = require(__dirname + '/app/playlistHandler.js');
var chatHandler = require(__dirname + '/app/chatHandler.js');

// Starts Server
var startServer = function () {
  socketHandler.setUpSockets();
  playlistHandler.handlePlaylist();
  chatHandler.analyzeChat();
};

// Centralize our chat messages & playlist as multiple helpers need to interface with them
module.exports.addMessage = function (message) {
  if (message.text.match(/^[\x20-\x7E]+$/)) {
    chatMessages.push(message);
  }
};

module.exports.getMessages = function () {
  return chatMessages;
};
module.exports.addToPlaylist = function (video) {
  // Prevent the same video from playing back-to-back
  if (video !== lastVideoInPlaylist) {
    currentPlaylist.push(video);
    lastVideoInPlaylist = video;
  }
};
module.exports.getPlaylist = function () {
  return currentPlaylist;
};
module.exports.getCurrentVideo = function () {
  return playlistHandler.currentVideo;
};

// Start running the server
startServer();

//The exported functions below are currently used for testing;  they can be safely deleted (or removed from export) at deployment
module.exports.getConnectionInfo = function () {
  return {
    clientSockets: socketHandler.activeSockets,
    numClients: socketHandler.numActiveClients
  };
};

module.exports.setTimeLeft = function (millisecondsBeforeEnd) {
  var currentVideo = playlistHandler.currentVideo;
  currentVideo.endMoment = moment().add(millisecondsBeforeEnd, 'ms');
  console.log('The end time for the current video has been modified to end ' + currentVideo.endMoment.calendar());
};

module.exports.queueVideo = function (youtubeUrl) {
  if (currentPlaylist.length === 0) {
    playlistHandler.playVideo(youtubeUrl);
  } else {
    currentPlaylist.push(youtubeUrl);
  }
};

