var app = require(__dirname + '/../server.js');
var youtube = require(__dirname + '/youtubeUtilities.js');
var chatAnalysisTime = app.emptyChatAnalysisTime;
var lastChatIdx = -1;

module.exports.analyzeChat = function () {
  var analyzeChat = function () {
    var chatMessages = app.getMessages();
    var bangs = [];
    for (var i = lastChatIdx + 1; i < chatMessages.length; i++) {
      var chatMessage = chatMessages[i].text;
     if (chatMessage.charAt(0) === "!") {
        bangs.push(chatMessage.substr(1));
      }
      lastChatIdx = i;
    }

    // Calculate top-desired bang
    var bangCounts = {};
    for (var j = 0; j < bangs.length; j++) {
      bangCounts[bangs[j]] = (bangCounts[bangs[j]] || 0) + 1;
    }
    var topBang = null;
    var topBangCount = 0;
    for (var bang in bangCounts) {
      if (bangCounts[bang] > topBangCount) {
        topBang = bang;
        topBangCount = bangCounts[bang];
      }
    }

    // Add the top-desired bang to the playlist
    if (topBang) {
        youtube.fetchYoutubeResults(topBang, function (results) {
        // Add the top result to our playlist
        app.addToPlaylist(results[0]);
      });
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
