var expect = require('chai').expect;
var app = require(__dirname + '/../../server/server.js');
var youtubeUtilities = require('../../server/app/youtubeUtilities.js');
var playlistHandler = require('../../server/app/playlistHandler.js');
var moment = require('moment');



describe('The fetchYoutubeResults function', function () {
  this.timeout(5000); //Increased time before which a 'timeout' is assumed, due to the Youtube API occasionally taking over 2 seconds to serve a request.

  it('fetches an array of video URLs from YouTube', function (done) {
    // fetchYoutubeResults fetches a list of IDs and URLs only
    youtubeUtilities.fetchYoutubeResults('george+michael', function (err, results) {
      expect(err).to.not.exist;
      expect(results).to.be.instanceof(Array);
      expect(/^https:\/\/www.youtube.com\/watch\?v=/.test(results[0])).to.be.true;
      done();
    });
  });

});

describe('The getVideoInfo function', function () {
  this.timeout(10000);
  it('fetches the snippet, contentDetails, and Id of a video from YouTube', function (done) {
    youtubeUtilities.getVideoInfo('izGwDsrQ1eQ', function (err, result) {
      expect(result.items).to.exist;
      expect(result.items).to.be.instanceof(Array);
      expect(result.items).to.have.length(1);
      expect(result.items[0].snippet).to.be.instanceof(Object);
      expect(result.items[0].contentDetails).to.be.instanceof(Object);
      done();
    });
  });
});

describe('The playVideo function', function () {
  this.timeout(10000);
  it('creates a data object with the url, id, title, startMoment, and endMoment of the current video', function (done) {
    playlistHandler.playVideo('https://www.youtube.com/watch?v=izGwDsrQ1eQ', function () {
      expect(playlistHandler.currentVideo.url).to.be.a("string");
      expect(/^https:\/\/www.youtube.com\/watch\?v=/.test(playlistHandler.currentVideo.url)).to.be.true;
      //make sure it's playing the video we want
      expect(/careless whisper/i.test(playlistHandler.currentVideo.title)).to.be.true;
      expect(playlistHandler.currentVideo.id).to.be.a("string");
      expect(playlistHandler.currentVideo.startMoment).to.be.an.instanceof(Object);
      expect(playlistHandler.currentVideo.endMoment).to.be.an.instanceof(Object);

      done();
    });
  });
});