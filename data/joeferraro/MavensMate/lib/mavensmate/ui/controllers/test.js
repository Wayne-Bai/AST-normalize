'use strict';

var fs              = require('fs');
var util            = require('../../util').instance;
var path            = require('path');
var jobQueue        = require('../../job-queue');
var logger          = require('winston');

var TestController = function(req) {
  this.client = req.app.get('client');
  this.swig = req.app.get('swig');
};

/**
 * GET
 */
TestController.prototype.new = function(req, res) {
  var self = this;
  res.render('unit_test/index.html', {
    testClasses : self._getTestClasses()
  });
};

/**
 * POST (async)
 */
TestController.prototype.execute = function(req, res) {
  var jobId = jobQueue.addJob();
  var self = this;

  logger.debug('received request to execute tests asynchronously: ');
  logger.debug(req.body);

  this.client.executeCommand('run-tests', req.body, function(err, commandResult) {
    if (err) {
      logger.debug('async request finished with error');
      logger.debug(err.message);
      jobQueue.finish(jobId, err, null);  
    } else {
      var resultHtml = self.swig.renderFile('ui/templates/unit_test/result.html', commandResult.result);
      jobQueue.finish(jobId, null, resultHtml);  
    }
  });
  
  return res.send({
    status: 'pending',
    id: jobId
  });
};

/**
 * POST (sync)
 */
TestController.prototype.coverage = function(req, res) {
  var locals = {
    apexClassOrTriggerName: req.body.apexClassOrTriggerName,
    type: req.body.type,
    uncoveredLines: req.body.uncoveredLines
  };

  var resultHtml = this.swig.renderFile('ui/templates/unit_test/coverage.html', locals);
  return res.send({
    result: resultHtml
  }); 
};

/**
 * Iterates project's classes directory looking for unit test classes
 * @return {Array}- Array of class names
 */
TestController.prototype._getTestClasses = function() {
  var self = this;
  var classes = [];
  var classPath = path.join(self.client.getProject().path, 'src', 'classes');
  if (fs.existsSync(classPath)) {
    fs.readdirSync(classPath).forEach(function(filename) {
      var fileNameParts = path.basename(filename).split('.');
      var bn = fileNameParts[0];
      if (fileNameParts.length === 2) {
        if (util.startsWith(bn, 'test') || util.endsWith(bn, 'test')) {
          classes.push(bn);
        }
      }
    });
  }
  return classes;
};

module.exports = TestController;