var moment = require('moment');
var app = require(__dirname + "/../server.js");

// Initializes io socket server
// var ioPort = 1337;

var io = module.exports.io = require('socket.io').listen(app.server);
console.log("Socket.io server listening");

// Keeps track of active clients
module.exports.activeSockets = [];
module.exports.numActiveClients = 0;

// Handles all behavior specific to a given socket
module.exports.setUpSockets = function () {
  io.on('connection', function (socket) {
    module.exports.activeSockets.push(socket);
    console.log("Connection established");
    module.exports.numActiveClients++;

    //This if statement stops the server from emitting a "play" message to the clients before the video data has been retrieved via Youtube API
    var currentSong = app.getCurrentSong();
    if (currentSong.startMoment !== null) {
       //The 'time' property is the number of milliseconds that the client should skip ahead when it plays the Youtube video
      socket.emit('play', {
        url: currentSong.url,
        title: currentSong.title,
        time: moment().diff(currentSong.startMoment)
      });
    }

    socket.on('disconnect', function (socket) {
      var sockIdx = module.exports.activeSockets.indexOf(socket);
      module.exports.activeSockets.splice(sockIdx, 1);
      module.exports.numActiveClients--;
    });

    // Handle incoming chat messages

    socket.on('chat message', function (msg) {
      app.addMessage(msg);
      io.emit('chat message', msg);
   });

    // Echo messages back to client (for use in debugging & testing)
    socket.on('echo', function (obj) {
      socket.emit(obj.name, obj.data);
    });
  });
  console.log('sockets established...');
};

// Handles behaviors for all sockets
module.exports.emitPlaylist = function () {
  var playlist = app.getPlaylist();
  console.log(playlist);
  io.emit('playlist', {
    playlist: playlist
  });
};
