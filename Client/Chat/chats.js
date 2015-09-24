angular.module('glitch.chats', [])
.controller('ChatsController', function($scope) {
    // Establish socket connection with our server
    $scope.chats = [
      {
        username: 'kyle',
        message: 'testmessage1',
        timestamp: Date.now()
      },
      {
        username: 'kyle',
        message: 'testmessage2',
        timestamp: Date.now()
      },
    {
      username: 'kyle',
      message: 'testmessage3',
      timestamp: Date.now()
    }
  ]

  socket.on('addMessage', function(msgObj) {
    $scope.chats.push(msgObj);
  });

  $scope.sendNewMessage = function() {
    var msgObj = {username:'kyle', message: $scope.chat.message, timestamp:Date.now()}
    $scope.chats.push(msgObj);
    socket.emit('sendNewMessage', msgObj);
  }
  // Have the listener HERE for the 'add new message' event, and it will also edit $scope.chats
  console.log('chat controller');
});