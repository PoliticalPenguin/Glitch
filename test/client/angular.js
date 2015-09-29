var assert = chai.assert;
var should = chai.should();
var expect = chai.expect;

describe('Client-side Angular', function() {
  beforeEach(module('glitch'));

  var $controller;
  var socketController;
  var notify;
  var socketFactory;

  beforeEach(inject(function(_$controller_) {
    $controller = _$controller_;
  }));

  describe('YouTube Handling', function() {
    var $scope;
    var controller;
    beforeEach(function() {
      $scope = {};
      controller = $controller('youtubeController', {$scope: $scope});
    });

    describe('Video Display', function() {
      it('should have a placeholder initial video', function() {
        expect($scope.currentVideo).to.exist;
        expect($scope.currentVideo.title).to.equal('Waiting For Server...');
      });
      it('should display videos', function(done) {
        setTimeout(function() {
          expect($scope.currentVideo.title).to.not.equal('Waiting For Server...');
          done();
        }, 1000);
      });
    });
    describe('Song History', function() {
      it('Should have an empty initial playlist', function() {
        expect($scope.pastVideos).to.have.length(0);
      });
      it('should add videos to the playlist', function(done) {
      });
    });
  });
  describe('Chat Message Handling', function() {
  });
});
