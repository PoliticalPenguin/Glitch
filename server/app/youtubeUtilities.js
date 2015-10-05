/*Youtube-API related utility functions that are used by the server to search for Youtube videos and retrieve video-specific
information. All functions which directly communicate with the Youtube API should be added here.*/


var https = require('https');
var app = require(__dirname + '/../server.js');
module.exports.fetchYoutubeResults = function (queryString, callback) {
  // Fetches only the IDs of the videos we are searching for
  var requestString = 'https://www.googleapis.com/youtube/v3/search?part=id&fields=items/id/videoId&type=video&videoEmbeddable=true&videoDuration=short&maxResults=' + app.youtubeResults + '&q=' + queryString + '&key=' + app.youtubeKey;
  https.get(requestString, function (res) {
    var body = '';
    res.on('data', function (chunk) {
      body += chunk;
    });
    res.on('end', function () {
      var object = JSON.parse(body);
      // Returns an array of video IDs and URLs as our playlist
      var results = object.items.map(function (item) {
        return 'https://www.youtube.com/watch?v=' + item.id.videoId;
      });
      callback(null, results);
    });
  }).on('error', function (err) {
    console.log("There was an error fetching the music files from Youtube: ", err);
    callback(err);
  });
};

module.exports.getVideoInfo = function (videoId, callback) {
  var requestString = 'https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=' + videoId + '&key=' + app.youtubeKey;
  https.get(requestString, function (res) {
    var body = '';
    res.on('data', function (chunk) {
      body += chunk;
    });
    res.on('end', function () {
      var object = JSON.parse(body);
      callback(null, object);
    });
  }).on('error', function (err) {
    callback(err);
    console.log("Got error: " + err.message);
  });
};
