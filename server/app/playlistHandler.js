/*Playlist related functions.  Playlist processing should be conducted server-side; the client should only be communicated
with when a new video is played from the playlist*/


var moment = require('moment');
var app = require(__dirname + '/../server.js');
var socketHandler = require(__dirname + '/socketHandler.js');
var youtube = require(__dirname + '/youtubeUtilities.js');

// Object which represents the current song being played; stores song title, start moment at which server told clients to first play the song, and end moment at which playback should end
module.exports.currentSong = {
  startMoment: null,
  endMoment: null,
  title: null
};

var donePlaying = true;
module.exports.handlePlaylist = function () {

  setInterval(function () {
    var currentPlaylist = app.getPlaylist();
    if (donePlaying && currentPlaylist.length > 0) {
      playSong(currentPlaylist[0]); //Updates the currentSong object with the first song in the playlist
      donePlaying = false;
    } else if (moment().isAfter(module.exports.currentSong.endMoment) && !donePlaying) {  //If the current time is after the endTime for the current entry being played
      playNext();
    }

    //Plays the first element from the playlist if the current song is done playing and the playlist is not empty
  }, app.playlistAnalysisTime);
};

// Play the next song in the queue. Used when a song ends or when voted upon
var playNext = module.exports.playNext = function () {
  donePlaying = true;
  var currentPlaylist = app.getPlaylist();
  currentPlaylist.shift();  //Deletes an entry from the playlist after it is done playing
};

var playSong = module.exports.playSong = function (playlistEntry, callback) {
  var parsedEntry = playlistEntry.split('=');
  youtube.getSongInfo(parsedEntry[1], function (err, result) {
    var contentDetails = result.items[0].contentDetails;
    var snippet = result.items[0].snippet;

    var videoDuration = moment.duration(contentDetails.duration);

    var end = moment();
    end.add(videoDuration);

    var newSong = {};
    newSong.id = parsedEntry[1];
    newSong.url = playlistEntry;
    newSong.title = snippet.title;
    newSong.startMoment = moment();
    newSong.endMoment = end;
    console.log(newSong.title + ' is now playing.  Video will end ' + newSong.endMoment.calendar());
    module.exports.currentSong = newSong;
    socketHandler.io.emit('play', {
      url: newSong.url,
      title: module.exports.currentSong.title,
      time: 0
    });

    if (callback) {
      callback();
    }
  });
};
