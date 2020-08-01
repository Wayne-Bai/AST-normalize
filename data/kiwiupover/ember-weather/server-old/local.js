/*
Use this while developing server/api/* files for auto restarting of server
+ appkit integration with grunt server:proxy

In termial 1:
  - nodemon server/local.js

In terminal 2:
  - grunt server:proxy

Make sure package.json proxyURL points to localhost:5000

Use server/production.js for full server in production

TODO: refactor so there is only one server
 */
var express = require('express')
  , server = express()
  , port = process.env.PORT || 5000
  , bodyParser = require('body-parser')
  , methodOverride = require('method-override')
  , logger = require('./api/logger')().logger

// server.use(logger('dev'));

server.use(bodyParser());
server.use(methodOverride());
require('./api/routes')(server);

server.listen(port, function () {
  console.log("Express server listening on port " + port);
});
