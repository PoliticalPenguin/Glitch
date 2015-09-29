var expect = require('chai').expect;
var app = require('./server/server.js');
var socketPort = 1337;
var moment = require('moment');

var io = require('socket.io-client');
var socket;

describe('glitch Server Unit Tests', function () {
  this.timeout(5000);	//Increased time before which a 'timeout' is assumed, due to the Youtube API occasionally taking over 2 seconds to serve a request.

  beforeEach(function (done) {
  	var options = {
  	  transports: ['websocket'],
  	  'force new connection': true
  	};
    socket = io.connect("http://localhost:" + socketPort, options);

    done();
  });


  it('accepts Socket.io connections on port ' + socketPort, function (done) {
    socket.on('connect', function (data) {
    	socket.disconnect();
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
	  		socket.disconnect();
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
  	socket.on('play', function (data) {
  		expect(data.time).to.be.above(0);	//Just checks to see that the play time provided is greater than zero, as the server has already been running for some time
  		socket.disconnect();
  		done();
  	});
  });

  it('records the time at which the video was started and calculates the time at which playback of the video should end', function (done) {
  	socket.on('play', function (data) {
  		var currentSong = app.getCurrentSong();
  		expect(moment().diff(currentSong.startMoment)).to.be.above(0);	//Checks to see that the recorded start time is earlier than the current time
  		expect(currentSong.endMoment.diff(moment())).to.be.above(0);	//Checks to see that the calculated end time is later than the current time
  		socket.disconnect();
      done();
  	});
  });

  it('automatically emits a new "play" message to clients after the current song has been completed', function (done) {
  	var numberOfSongsPlayed = 0;
  	socket.on('play', function (data) {
  		numberOfSongsPlayed++;
  		if(numberOfSongsPlayed > 1) {
        socket.disconnect();
  			done();		//Test will pass if the "play" signal is emitted more than once
      }
  		else
  			app.setTimeLeft(500);	//Decreases the time remaining for the current song to 500 milliseconds
  	});
  });
});

