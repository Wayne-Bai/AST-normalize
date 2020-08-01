
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path');

var app = express();

app.configure('development', function(){
  app.use(require('./utils/livereload').livereloadSnippet);
  app.use(express.errorHandler());
  app.use(express.static(path.join(__dirname, 'client', '.tmp')));
  app.use(express.static(path.join(__dirname, 'client', 'app')));
});

app.configure('production', function(){
  app.use(express.errorHandler());
  app.use(express.static(path.join(__dirname, 'client', 'dist')));
});

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/client/app');
  app.engine('html', require('ejs').renderFile);
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
});

app.get('/', routes.index);

module.exports = app;