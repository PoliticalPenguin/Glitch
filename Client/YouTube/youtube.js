// Angular controller for dealing with playback of youtube songs
angular.module('glitch.youtube', [
  'youtube-embed'
  ])
.controller('youtubeController', function($scope) {
  $scope.pastVideos = [
    'Test1',
    'Test2',
    'Test',
    'Test',
    'Test',
    'Test',
    'Test',
    'Test',
    'Test',
    'Test',
    'Test',
    'Test',
  ]

  // Stores the currently playing video
  $scope.currentVideo = {  
    url: 'https://www.youtube.com/watch?v=3PEGDGxZdzA#t=300s',
    title: "Emancipator - Anthem",
    duration: 60000,
  };
  
  // Stores the settings for the youtube-video element
  $scope.playerVars = {
    controls: 0,
    autoplay: 1
  }

  // Listen for a broadcast from the server
  // socket.on('playVideo', function(data) {
  //   // ALSO: we are going to push to past videos the current video 
  //   // also also: add the timestart to the url, if necessary 
  //   // $scope.currentVideo = PARSED FROM DATA
  // })
})