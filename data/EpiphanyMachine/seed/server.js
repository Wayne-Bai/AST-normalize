(function() {
  var app, express;

  express = require('express');

  app = express();

  app.use(express["static"](__dirname + '/app'));

  app.listen("4000");

  console.log('Server started at http://localhost:4000');

}).call(this);
