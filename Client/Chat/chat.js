angular.module('glitch.chat', [])
.controller('chatController', function ($scope, socket) {

  $scope.messages = [];

  $scope.sendMessage = function (keyEvent) {
    // console.log($scope.messageText);
    socket.emit('chat message', $scope.messageText);
    $scope.messageText = '';
  };

  socket.on('chat message', function (msg) {
    $scope.messages.push(msg);
  });
});


