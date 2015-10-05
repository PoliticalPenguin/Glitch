/*These functions relate to selecting a subset of chat messages to analyze, pulling from each chat message only the text
which will be used for Youtube queries (in the current version of Glitch, only those messages preceded by an '!').*/


var app = require(__dirname + '/../server.js');
var youtube = require(__dirname + '/youtubeUtilities.js');
var chatAnalysisTime = app.chatAnalysisTime;
var lastChatIdx = -1;

module.exports.analyzeChat = function () {
  setInterval(function () {
    var chatMessages = app.getMessages();
    var bangs = [];
    for (var i = lastChatIdx + 1; i < chatMessages.length; i++) {
      var chatMessage = chatMessages[i].text;
     if (chatMessage.charAt(0) === "!") {
        bangs.push(chatMessage.substr(1));
      }
      lastChatIdx = i;
    }

    // For each bang, use the Youtube Search API
    for (var j = 0; j < bangs.length; j++) {
      youtube.fetchYoutubeResults(bangs[j], function (err, results) {
        // Add the top result to our playlist
        app.addToPlaylist(results[0]);
      });
    }
  }, chatAnalysisTime);
};
