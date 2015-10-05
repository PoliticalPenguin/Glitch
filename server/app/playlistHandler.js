/*Playlist related functions.  Playlist processing should be conducted server-side; the client should only be communicated
with when a new video is played from the playlist*/


var moment = require('moment');
var app = require(__dirname + '/../server.js');
var socketHandler = require(__dirname + '/socketHandler.js');
var youtube = require(__dirname + '/youtubeUtilities.js');

// Object which represents the current video being played; stores video title, start moment at which server told clients to first play the video, and end moment at which playback should end
module.exports.currentVideo = {
  startMoment: null,
  endMoment: null,
  title: null
};

var donePlaying = true;
module.exports.handlePlaylist = function () {

  setInterval(function () {
    var currentPlaylist = app.getPlaylist();
    if (donePlaying && currentPlaylist.length > 0) {
      playVideo(currentPlaylist[0]); //Updates the currentVideo object with the first video in the playlist
      donePlaying = false;
    } else if (moment().isAfter(module.exports.currentVideo.endMoment) && !donePlaying) {  //If the current time is after the endTime for the current entry being played
      playNext();
    }

    //Plays the first element from the playlist if the current video is done playing and the playlist is not empty
  }, app.playlistAnalysisTime);
};

// Play the next video in the queue. Used when a video ends or when voted upon
var playNext = module.exports.playNext = function () {
  donePlaying = true;
  var currentPlaylist = app.getPlaylist();
  currentPlaylist.shift();  //Deletes an entry from the playlist after it is done playing
};

var playVideo = module.exports.playVideo = function (playlistEntry, callback) {
  var parsedEntry = playlistEntry.split('=');
  youtube.getVideoInfo(parsedEntry[1], function (err, result) {
    var contentDetails = result.items[0].contentDetails;
    var snippet = result.items[0].snippet;

    var videoDuration = moment.duration(contentDetails.duration);

    var end = moment();
    end.add(videoDuration);

    var newVideo = {};
    newVideo.id = parsedEntry[1];
    newVideo.url = playlistEntry;
    newVideo.title = snippet.title;
    newVideo.startMoment = moment();
    newVideo.endMoment = end;
    console.log(newVideo.title + ' is now playing.  Video will end ' + newVideo.endMoment.calendar());
    module.exports.currentVideo = newVideo;
    socketHandler.io.emit('play', {
      url: newVideo.url,
      title: module.exports.currentVideo.title,
      time: 0
    });

    if (callback) {
      callback();
    }
  });
};
