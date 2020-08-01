// app.js

var IoC = require('electrolyte')
var igloo = require('../')
var path = require('path')
var express = require('express')
var winstonRequestLogger = require('winston-request-logger')

IoC.loader(IoC.node(path.join(__dirname, 'boot')))
IoC.loader('igloo', igloo)

// logger component
var logger = IoC.create('igloo/logger')
logger.info('Hello world')

// settings component
var settings = IoC.create('igloo/settings')

// basic server

var app = express()

// winston request logger before everything else
// but only if it was enabled in settings
if (settings.logger.requests)
  app.use(winstonRequestLogger.create(logger))

app.get('/', function(req, res, next) {
  res.send("It's cold outside, but warm in the igloo")
})

app.listen(settings.port, function() {
  logger.info('Server started on port %d', settings.port)
})
