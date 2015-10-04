var expect = require('chai').expect;
var app = require(__dirname + '/../../server/server.js');
var youtubeUtilities = require('../../server/app/youtubeUtilities.js');
var playlistHandler = require('../../server/app/playlistHandler.js');
var moment = require('moment');



describe('The fetchYoutubeResults function', function () {
  this.timeout(5000); //Increased time before which a 'timeout' is assumed, due to the Youtube API occasionally taking over 2 seconds to serve a request.

  it('fetches an array of video URLs from YouTube', function (done) {
    youtubeUtilities.fetchYoutubeResults('george+michael', function (err, results) {
      expect(err).to.not.exist;
      expect(results).to.be.instanceof(Array);
      expect(/^https:\/\/www.youtube.com\/watch\?v=/.test(results[0])).to.be.true;
      done();
    });
  });

});

describe('The getSongInfo function', function () {
  this.timeout(10000);

  it('fetches the snippet, contentDetails, and Id of a song from YouTube', function (done) {
    youtubeUtilities.getSongInfo('izGwDsrQ1eQ', function (err, result) {
      expect(result.items).to.exist;
      expect(result.items).to.be.instanceof(Array);
      expect(result.items).to.have.length(1);

      expect(result.items[0].snippet).to.be.instanceof(Object);
      expect(result.items[0].contentDetails).to.be.instanceof(Object);
      done();
    });
  });
});

describe('The playSong function', function () {
  this.timeout(10000);

  it('creates a data object with the url, id, title, startMoment, and endMoment of the current song', function (done) {
    playlistHandler.playSong('https://www.youtube.com/watch?v=izGwDsrQ1eQ', function () {
      expect(playlistHandler.currentSong.url).to.be.a("string");
      expect(/^https:\/\/www.youtube.com\/watch\?v=/.test(playlistHandler.currentSong.url)).to.be.true;

      expect(playlistHandler.currentSong.title).to.be.a("string");
      expect(playlistHandler.currentSong.id).to.be.a("string");
      expect(playlistHandler.currentSong.startMoment).to.be.an.instanceof(Object);
      expect(playlistHandler.currentSong.endMoment).to.be.an.instanceof(Object);

      done();
    });
  });
});