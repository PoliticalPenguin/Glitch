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

module.exports.getSongInfo = function (parsedEntry, callback) {
  var requestString = 'https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=' + parsedEntry[1] + '&key=' + app.youtubeKey;
  https.get(requestString, function (res) {
    var body = '';
    res.on('data', function (chunk) {
      body += chunk;
    });
    res.on('end', function () {
      var object = JSON.parse(body);
      callback(object);
    });
  }).on('error', function (e) {
    console.log("Got error: " + e.message);
  });
};
