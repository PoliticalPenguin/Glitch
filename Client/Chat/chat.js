angular.module('glitch.chat', [])
.controller('chatController', function($scope) {
  // Stores the previously played videos
  $scope.messages = [];

  $scope.sendMessage = function(keyEvent) {
    // console.log($scope.messageText);
    socket.emit('chat message', $scope.messageText);
    $scope.messageText = '';
  };

  socket.on('chat message', function(msg) {
    $scope.messages.push(msg);
  });
});


