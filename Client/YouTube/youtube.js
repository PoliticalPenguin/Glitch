// Angular controller for dealing with playback of youtube songs
angular.module('glitch.youtube', [
  'youtube-embed'
  ])
.controller('youtubeController', function($scope) {
  // Stores the previously played videos
  $scope.pastVideos = [
  ]

  // Stores the currently playing video
  $scope.currentVideo = {  
    url: 'https://www.youtube.com/watch?v=8tPnX7OPo0Q',
    title: "Waiting For Server...",
  };
  
  // Stores the settings for the youtube-video element
  $scope.playerVars = {
    controls: 0,
    autoplay: 1
  }

  // Listen for a broadcast from the server
  socket.on('play', function(data) {
    $scope.currentVideo.url = data.url + "#t=" + (data.time / 1000) +"s";
    $scope.currentVideo.title = data.url;
    $scope.pastVideos.push(data.url);
  })
})