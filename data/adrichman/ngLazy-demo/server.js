'use strict';

var express         = require('express'),
    morgan          = require('morgan'),
    port            = process.env.PORT || 3000,
    app             = express();

app.listen(port);
//////////////////////////////////////////////
// express logging                          //
//////////////////////////////////////////////
app.use(morgan({ format: 'dev', immediate: true }));

//////////////////////////////////////////////
// serve static assets and route handlers   //
//////////////////////////////////////////////
app.use(express.static(__dirname + "/app"));

app.get('/', function(req, res){
  res.sendfile('./app/index.html')
});

app.get('*', function(req, res){
  res.redirect('/');
});
console.log('Server listening on port: ' + port);