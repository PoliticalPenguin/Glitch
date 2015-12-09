/* Angular controller for dealing with playback of youtube videos */
angular.module('glitch.youtube', [
  'youtube-embed'
  ])
.controller('youtubeController', function ($scope, socket) {
  // Stores the previously played videos
  $scope.pastVideos = [
  ];

  $scope.upcomingVideos = [
  ];

  // Stores the currently playing video
  $scope.currentVideo = {
    id: null,
    url: 'https://www.youtube.com/watch?v=49fv5foZnBs',
    title: "Default video is playing... type '!'+ some words in the chat to start the queue"
  };

  // Stores the settings for the youtube-video element
  $scope.playerVars = {
    controls: 0,
    autoplay: 1
  };

  // Listen for a broadcast from the server
  socket.on('play', function (data) {
    if ($scope.currentVideo.id !== null) {
      $scope.pastVideos.push($scope.currentVideo.title);
      if($scope.pastVideos.length>5) {
        $scope.pastVideos.shift();
      }
    }

    $scope.currentVideo.url = data.url + "#t=" + (data.time / 1000) + "s";
    $scope.currentVideo.title = data.title;
    $scope.currentVideo.id = data.id;

    $scope.upcomingVideos.shift();
  });

  socket.on('playlist', function (data) {
    $scope.upcomingVideos = data.playlist.slice(1);
  });
});
