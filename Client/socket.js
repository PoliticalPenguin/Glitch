// var socket = io.connect(window.location.protocol+"//"+window.location.hostname+":"+1337);

glitch.factory('socket', function ($rootScope) {
  var socket = io.connect(window.location.protocol + "//" + window.location.hostname + ":" + 1337);
  return {
    on: function (eventName, callback) {
      socket.on(eventName, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      });
    },
    emit: function (eventName, data, callback) {
      socket.emit(eventName, data, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      });
    }
  };
});
