var headers = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, accept",
  "access-control-max-age": 10, // Seconds.
  'Content-Type': "application/json"
};

exports.sendResponse = function (response, data, statusCode) {
  statusCode = statusCode || 200;
  response.writeHead(statusCode, headers);
  response.end(JSON.stringify(data));
};

exports.collectData = function (request, callback) {
  var data = "";
  request.on('data', function (chunk) {
    console.log('processing chunk');
    data += chunk;
  });
  request.on('end', function () {
    console.log('processing ended');
    callback(JSON.parse(data));
  });
};

exports.makeActionHandler = function (actionMap) {
  return function (request, response) {
    var action = actionMap[request.method];
    if (action) {
      action(request, response);
    } else {
      exports.sendResponse(response, '', 404);
    }
  };
};
