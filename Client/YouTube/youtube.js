// Angular controller for dealing with playback of youtube songs
angular.module('glitch.youtube', [
  'youtube-embed'
  ])
.controller('youtubeController', function($scope) {
  // Stores the currently playing video
  $scope.currentVideo = 'https://www.youtube.com/watch?v=3PEGDGxZdzA';
  
  // Stores the settings for the youtube-video element
  $scope.playerVars = {
    controls: 0,
    autoplay: 1
  }

  // Listen for a broadcast from the server
  socket.on('playVideo', function(data) {
    
    // $scope.currentVideo = PARSED FROM DATA
  })
})