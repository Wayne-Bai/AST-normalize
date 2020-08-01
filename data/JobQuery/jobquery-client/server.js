var express = require('express');
var app = express();

var path = require('path');

app.use('/assets', express.static(path.resolve(__dirname + '/public/assets')));
app.use('/bower_components', express.static(path.resolve(__dirname + '/public/bower_components')));
app.use('/js', express.static(path.resolve(__dirname + '/public/js')));
app.use('/lib', express.static(path.resolve(__dirname + '/public/lib')));
app.use('/mocks', express.static(path.resolve(__dirname + '/public/mocks')));
app.use('/node_modules', express.static(path.resolve(__dirname + '/node_modules')));

app.get( '/*', function( req, res, next ) {
  res.sendfile(path.resolve(__dirname + '/public/index.html'));
});

app.listen(process.env.PORT || 8000);
