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

module.exports.handlePlaylist = function () {
  var donePlaying = true;

  setInterval(function () {
    var currentPlaylist = app.getPlaylist();
    if (donePlaying && currentPlaylist.length > 0) {
      playSong(currentPlaylist[0]); //Updates the currentSong object with the first song in the playlist
      donePlaying = false;
    }


    if (moment().isAfter(module.exports.currentSong.endMoment)) {  //If the current time is after the endTime for the current entry being played
      donePlaying = true;
      currentPlaylist.shift();  //Deletes an entry from the playlist after it is done playing
    }

    //Plays the first element from the playlist if the current song is done playing and the playlist is not empty
  }, app.playlistAnalysisTime);
};

var playSong = module.exports.playSong = function (playlistEntry) {
  var parsedEntry = playlistEntry.split('=');
  youtube.getSongInfo(parsedEntry, function (object) {
    var contentDetails = object.items[0].contentDetails;
    var snippet = object.items[0].snippet;

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
  });
};
