var https = require('https');
var app = require(__dirname+'../../server.js');
var chatAnalysisTime = app.chatAnalysisTime;
var lastChatIdx = -1;
var fetchPlaylistFromYouTube = function (queryString, callback) {
  // Fetches only the IDs of the videos we are searching for
  var requestString = 'https://www.googleapis.com/youtube/v3/search?part=id&fields=items/id/videoId&type=video&videoEmbeddable=true&videoDuration=short&maxResults='+app.youtubeResults+'&q='+ queryString + '&key=' + app.youtubeKey;
  https.get(requestString, function(res) {
    var body = '';
    res.on('data', function(chunk) {
      body += chunk;
    });
    res.on('end', function() {
      var object = JSON.parse(body);
      // Returns an array of video IDs and URLs as our playlist
      var results = object.items.map(function(item) {
        return 'https://www.youtube.com/watch?v=' + item.id.videoId;
      });
      callback(results);
    });
  }).on('error', function(err) {
    console.log("There was an error fetching the music files from Youtube: ", err);
  }); 
};

module.exports.analyzeChat = function() {
  setInterval(function() {
    var chatMessages = app.getMessages();
    var bangs = [];
    for (var i = lastChatIdx+1; i < chatMessages.length; i++) {
      var chatMessage = chatMessages[i];
      if (chatMessage.charAt(0) === "!") {
        bangs.push(chatMessage.substr(1));
      }
      lastChatIdx = i;
    }

    // For each bang, use the Youtube Search API
    for (var j = 0; j < bangs.length; j++) {
      fetchPlaylistFromYouTube(bangs[j], function(results) {
        // Add the top result to our playlist
        app.addToPlaylist(results[0]);
      });
    }
  }, chatAnalysisTime);
}
