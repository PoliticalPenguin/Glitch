var assert = chai.assert;
var should = chai.should();
var expect = chai.expect;

describe('Client-side Angular', function () {
  beforeEach(module('glitch'));
  var $controller;
  var socket;
  this.timeout(5000);
  beforeEach(inject(function (_$controller_, _socket_) {
    $controller = _$controller_;
    socket = _socket_;
  }));

  describe('YouTube Handling', function () {
    var $scope;
    var controller;
    beforeEach(function () {
      $scope = {};
      controller = $controller('youtubeController', {
        $scope: $scope
      });
    });

    describe('Video Display', function () {
      it('should have a placeholder initial video', function () {
        expect($scope.currentVideo).to.exist;
        expect($scope.currentVideo.title).to.equal('Waiting For Server...');
      });
      it('should display videos', function (done) {
        socket.emit('echo', {
          name: 'play',
          data: {
            url: 'https://www.youtube.com/watch?v=3PEGDGxZdzA',
              title: "Emancipator - Anthem (2006)"
          }
        });
        setTimeout(function () {
          expect($scope.currentVideo.title).to.not.equal('Waiting For Server...');
          done();
        }, 2000);
      });
    });

    describe('Video History', function () {
      it('Should have an empty initial playlist', function () {
        expect($scope.pastVideos).to.have.length(0);
      });
      it('should add videos to the playlist', function (done) {
        socket.emit('echo', {
          name: 'play',
          data: {
            url: 'https://www.youtube.com/watch?v=3PEGDGxZdzA',
              title: "Emancipator - Anthem (2006)"
          }
        });

        setTimeout(function () {
          expect($scope.pastVideos.length).to.not.equal(0);
          done();
        }, 2000);
      });
    });
  });

  describe('Chat Message Handling', function () {
    var $scope;
    var controller;
    beforeEach(function () {
      $scope = {};
      controller = $controller('chatController', {
        $scope: $scope
      });
    });


    describe('Send message button', function () {
      it('sendMessage function should add the appropriate message to the messages array in client', function (done) {
        var oldMessagesLength = $scope.messages.length;
        $scope.username = 'musicfan1';
        $scope.messageText = 'I love listening to Careless Whisper while drinking a glass of red wine';
        $scope.sendMessage();

        setTimeout(function () {
          expect($scope.messages.length).to.equal(oldMessagesLength + 1);
          expect($scope.messages[0].username).to.equal('musicfan1');
          expect($scope.messages[0].text).to.equal('I love listening to Careless Whisper while drinking a glass of red wine');
          done();
        }, 2000);
      });
    });

    describe('Chat message socket events', function () {
      it('emitting a "chat message" socket event from the client should add the appropriate message to the messages array in client', function (done) {
        socket.emit('chat message', {
          username: 'musicfan1000',
          text: 'I love listening to Careless Whisper while drinking a glass of red wine'
        });

        setTimeout(function () {
          expect($scope.messages.length).to.equal(1);
          expect($scope.messages[0].username).to.equal('musicfan1000');
          expect($scope.messages[0].text).to.equal('I love listening to Careless Whisper while drinking a glass of red wine');
          done();
        }, 2000);
      });
    });

    describe('Chat processing - client side', function () {
      it('sending a chat with the appropriate keywords should fetch a music video, which should start playing when the queue is empty', function (done) {
        $scope.username = 'musicfan1';
        $scope.messageText = '!careless whisper';
        $scope.sendMessage();
        $scope = {};
        controller = $controller('youtubeController', {
          $scope: $scope
        });

        setTimeout(function () {
          expect(/careless whisper/i.test($scope.currentVideo.title)).to.be.true;
          done();
        }, 3000);
      });
    });
  });
});
