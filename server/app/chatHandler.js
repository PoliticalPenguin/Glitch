/*These functions relate to selecting a subset of chat messages to analyze, pulling from each chat message only the text
which will be used for Youtube queries (in the current version of Glitch, only those messages preceded by an '!').*/


var app = require(__dirname + '/../server.js');
var youtube = require(__dirname + '/youtubeUtilities.js');
var sockets = require(__dirname + '/socketHandler.js');
var playlist = require(__dirname + '/playlistHandler.js');
var chatAnalysisTime = app.emptyChatAnalysisTime;
var lastChatIdx = -1;

var specialBangs = {
  next: function () {
    playlist.playNext();
  }
};

// Count the frequency of all bangs
var countBangs = module.exports.countBangs = function (bangs) {
  var bangCounts = {};
  for (var j = 0; j < bangs.length; j++) {
    bangCounts[bangs[j]] = (bangCounts[bangs[j]] || 0) + 1;
  }
  return bangCounts;
};

// Calculate top-desired song
var getTopSong = module.exports.getTopSong = function (bangs, bangCounts) {
  var topSong = null;
  var topSongCount = 0;
  for (var bang in bangCounts) {
    if (bangCounts[bang] > topSongCount && (!specialBangs[bang])) {
      topSong = bang;
      topSongCount = bangCounts[bang];
    }
  }

  return topSong;
};

// Add the top result to our playlist
var addTopSong = module.exports.addTopSong = function (topSong) {
  youtube.fetchYoutubeResults(topSong, function (err, results) {
    app.addToPlaylist(results[0]);
    sockets.emitPlaylist();
  });
};

// Periodically analyze chat and take appropriate action
module.exports.analyzeChat = function () {
  var analyzeChat = function () {
    var chatMessages = app.getMessages();
    var bangs = [];
    var initChatIdx = lastChatIdx;
    for (var i = lastChatIdx + 1; i < chatMessages.length; i++) {
      var chatMessage = chatMessages[i].text;
     if (chatMessage.charAt(0) === "!") {
        bangs.push(chatMessage.substr(1));
      }
      lastChatIdx = i;
    }

    var bangCounts = countBangs(bangs);
    var topSong = getTopSong(bangs, bangCounts);

    // Determine if any action needs to be taken due to special bangs
    for (var bang in specialBangs) {
      if (bangCounts[bang] && bangCounts[bang] / (lastChatIdx - initChatIdx) > app.bangRatios[bang]) {
        specialBangs[bang]();
      }
    }

    // Add the top-desired bang to the playlist and broadcast to clients
    if (topSong) {
      addTopSong(topSong);
    }

    // Re-run the chat handler
    if (app.getPlaylist().length <= 1) {
      chatAnalysisTime = app.emptyChatAnalysisTime;
    } else {
      chatAnalysisTime = app.fullChatAnalysisTime;
    }
    setTimeout(analyzeChat, chatAnalysisTime);
  };
  setTimeout(analyzeChat, chatAnalysisTime);
};
