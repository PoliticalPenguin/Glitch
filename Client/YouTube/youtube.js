// Angular controller for dealing with playback of youtube songs
angular.module('glitch.youtube', [
  'youtube-embed'
  ])
.controller('youtubeController', function($scope) {
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
    console.log(data);
     // ALSO: we are going to push to past videos the current video 
     // also also: add the timestart to the url, if necessary 
     // $scope.currentVideo = PARSED FROM DATA
    $scope.currentVideo.url = data.url + "#t=" + (data.time / 1000) +"s";
    $scope.currentVideo.title = data.url;
    $scope.pastVideos.push(data.url);
  })
})