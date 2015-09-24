angular.module('glitch.auth', [])
.controller('AuthController', function($scope){
  $scope.loginDisplay = false;
  
  socket.on('notLoggedIn', function() {
    $scope.loginDisplay = true;
  });

  socket.on('loggedIn', function() {
    $scope.loginDisplay = false;
  })
})