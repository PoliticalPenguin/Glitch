var app = require(__dirname + '/../server.js');
var youtube = require(__dirname + '/youtubeUtilities.js');
var chatAnalysisTime = app.chatAnalysisTime;
var lastChatIdx = -1;

module.exports.analyzeChat = function () {
  setInterval(function () {
    var chatMessages = app.getMessages();
    var bangs = [];
    for (var i = lastChatIdx + 1; i < chatMessages.length; i++) {
      var chatMessage = chatMessages[i];
      if (chatMessage.charAt(0) === "!") {
        bangs.push(chatMessage.substr(1));
      }
      lastChatIdx = i;
    }

    // For each bang, use the Youtube Search API
    for (var j = 0; j < bangs.length; j++) {
      youtube.fetchYoutubeResults(bangs[j], function (results) {
        // Add the top result to our playlist
        app.addToPlaylist(results[0]);
      });
    }
  }, chatAnalysisTime);
};
