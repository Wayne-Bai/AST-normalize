
var express = require('express');
var http = require('http');
var path = require('path');
var app = express();
var mongoose=require('mongoose')
var settings=require('./settings.js')
var db=require('./config/db')
require("./config/express")(app);
require("./config/routes")(app);
app.on('close',function(err)
{
  db.disconnect();
});

http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});
