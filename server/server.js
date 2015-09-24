var express = require('express');
var db = require('./db');
var server = require('http');
var parser = require('body-parser');
var router = require('./routes.js');



//Initialize connection to the database
db.initialize( function () {
  app.set("port", 3000);

  app.use(parser.json());

  app.use('/api', router);

  app.use(express.static(__dirname + '/../client'));

  if (!module.parent) {
    app.listen(app.get("port"));

  console.log("Listening on ", app.get("port"));
  }
});


//Initializes io socket server
var io = require('socket.io')(server);
var ioPort = 1337;
server.listen(ioPort, function(err) {
  if (err) { console.log(err); }
  console.log("Listening on port " + ioPort);
});

require('socketio-auth')(io, {
  authenticate: function (socket, data, callback) {
    var username = data.username;
    var password = data.password;

    //Write the mysql code
  }
});

//Initializes express server
var app = express();
module.exports.app = app;

//io socket-related code
// Socket API
// Client-side
// postmessage(obj)
// login(obj)
// createUser(obj)
// logout()

// Server-side

// loggedIn
// notLoggedIn
// addMessage(obj)
// changeSong(locationString)

//Listens for and initializes client connections

//isAuthenticated reflects whether a socket in activeSocket with the same index number
//has been authenticated by the Express server.
var activeSockets = [];
var isAuthenticated = [];

var numActiveClients = 0;

io.on('connection', function(socket) {
  activeSockets.push(socket);
  isAuthenticated.push(false);
  console.log("Connection established");
  numActiveClients++;

  //Write function to check for authentication token, if exists then
  //emit a 'loggedIn' to the socket
  
  // Create listeners on each client socket for song updates
  socket.on('disconnect', function(socket) {
    var sockIdx = activeSockets.indexOf(socket);
    activeSockets.splice(sockIdx, 1);
    isAuthenticated.splice(sockIdx, 1);
    // var idx = players.indexOf(socket.player);
    // players.splice(idx, 1);
    numActiveClients--;
  });

  socket.on('postMessage', function(message) {
    //Check boolean to see if the socket has been authenticated
      if(authenticated) {
        io.emit('addMessage', message);
      }

      //Add code to write to database
  });

  socket.on('login', function(credentials) {
    //Add code to check database for username + password

    if(loginSuccess) {
      socket.emit('loggedIn', {});
    }
    else {
      socket.emit('notLoggedIn', {});
    }

  });

  socket.on('createUser', function(credentials) {

  });

  socket.on('logout', function() {
    //Token

  });

  //Stub for activities we want to do on an interval, such as voting
  // setInterval(serverTick, _settings.serverTick);
  // function serverTick() {
  //   var now = Date.now();
  // };



