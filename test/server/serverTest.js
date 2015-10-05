var expect = require('chai').expect;
var app = require('../../server/server.js');
var socketPort = 1337;
var moment = require('moment');
var chat = require('../../server/app/chatHandler.js');

var io = require('socket.io-client');
var socket;

describe('glitch Server Integration Tests', function () {
  this.timeout(5000); //Increased time before which a 'timeout' is assumed, due to the Youtube API occasionally taking over 2 seconds to serve a request.

  beforeEach(function () {
    var options = {
      transports: ['websocket'],
      'force new connection': true
    };
    socket = io.connect("http://localhost:" + socketPort, options);
    app.queueVideo('https://www.youtube.com/watch?v=3PEGDGxZdzA');
  });

  afterEach(function () {
    app.setTimeLeft(0);
    socket.disconnect();
  });


  it('accepts Socket.io connections on port ' + socketPort, function (done) {
    socket.on('connect', function (data) {
      done();
    });
  });

  it('can handle multiple Socket.io connections', function (done) {
    socket.on('connect', function (data) {
      var connectionInfo = app.getConnectionInfo();
      expect(connectionInfo.numClients).to.equal(1);
      var socket2 = io.connect("http://localhost:" + socketPort, {
        transports: ['websocket'],
        'force new connection': true
      });
      socket2.on('connect', function (data2) {
        var connectionInfo2 = app.getConnectionInfo();
        expect(connectionInfo2.numClients).to.equal(2);
        socket2.disconnect();
        done();
      });
    });
  });

  it('emits "play" messages to clients, which contain a URL (string), title (string) and play time (integer) for each Youtube video', function (done) {
    socket.on('play', function (data) {
      expect(data).to.contain.all.keys(['url', 'title', 'time']);
      expect(typeof data.url).to.equal('string');
      expect(typeof data.title).to.equal('string');
      expect(typeof data.time).to.equal('number');
      socket.disconnect();
      done();
    });

  });

  it('gives clients who connect after a video has started playing a non-zero play time which is equal to the server play time', function (done) {
    setTimeout(function () {
      var socket2 = io.connect("http://localhost:" + socketPort, {
        transports: ['websocket'],
        'force new connection': true
      });
      socket2.on('play', function (data) {
        expect(data.time).to.be.above(0); //Just checks to see that the play time provided is greater than zero, as the server has already been running for some time
        socket2.disconnect();
        done();
      });
    }, 1000);
  });

  it('records the time at which the video was started and calculates the time at which playback of the video should end', function (done) {
    socket.on('play', function (data) {
      var currentVideo = app.getCurrentVideo();
      expect(currentVideo.endMoment.diff(currentVideo.startMoment)).to.be.above(0);  //Checks to see that there is a calculated end time which is after the start time
      done();
    });
  });

  it('automatically emits a new "play" message to clients after the current video has been completed', function (done) {
    app.queueVideo('https://www.youtube.com/watch?v=3PEGDGxZdzA');
    var numberOfVideosPlayed = 0;
    socket.on('play', function (data) {
      numberOfVideosPlayed++;
      if (numberOfVideosPlayed > 1) {
        socket.disconnect();
        done();   //Test will pass if the "play" signal is emitted more than once
      } else {
        app.setTimeLeft(500); //Decreases the time remaining for the current video to 500 milliseconds
      }
    });
  });

  it('should be able to calculate the frequency of emitted keywords', function () {
    var bangs = ['next', 'next', 'tswift', 'tswift', 'tswift'];
    expect(chat.countBangs(bangs)).to.eql({
      next: 2,
      tswift: 3
    });
  });

  it('should be able to calculate the top requested song', function () {
    var bangs = ['test', 'test', 'tswift', 'tswift', 'tswift', 'next', 'next', 'next', 'next', 'next'];
    var bangCount = chat.countBangs(bangs);
    expect(chat.getTopSong(bangs, bangCount)).to.equal('tswift');
  });

  it('should be able to emit new playlists', function (done) {
    chat.addTopSong('tswift');
    socket.on('playlist', function (playlist) {
      expect(playlist.playlist[0].id).to.equal('IdneKLhsWOQ');
      done();
    });
  });

  it('should be able to skip songs', function (done) {
    app.queueSong('https://www.youtube.com/watch?v=3PEGDGxZdzA');
    var bangs = ['next', 'next', 'next'];
    socket.on('play', function (song) {
      expect(song.title).to.equal('Emancipator - Anthem (2006)');
      done();
    });
  });
});

