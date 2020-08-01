var express = require('express');
var path = require('path');

// CORS
var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Expose-Headers', 'Content-Length, Content-Type, Location');
    res.header('Access-Control-Allow-Headers', 'Content-Length, Content-Type, X-Annotator-Auth-Token, X-Requested-With');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.header('Access-Control-Max-Age', '86400');

    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
     res.send(200);
    }
    else {
     next();
    }
};

module.exports = function(app) {
  // Configuration for all environments
  app.set('port', process.env.PORT || 3000);
  app.set('views', path.join(__dirname, '..', 'views'));
  app.engine('html', require('ejs').renderFile);
  app.use(passport.initialize());
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(allowCrossDomain);
  app.use(express.bodyParser());
  app.use(express.cookieParser('Secret'));
  app.use(express.session());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, '..', 'public')));

  

  // Development configuration
  if (app.get('env') === 'development') {
    app.set('db', 'open_shakespeare');
    app.use(express.errorHandler());
  }
  else if (app.get('env') === 'production') {
    app.set('db', 'open_shakespeare-prod');
  }
};
