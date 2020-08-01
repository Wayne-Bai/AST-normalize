'use strict';

var helper      = require('../../test-helper');
var chai        = require('chai');
var should      = chai.should();

describe('mavensmate execute-apex', function() {

  var project;
  var testClient;
 
  before(function(done) {
    this.timeout(8000);
    helper.unlinkEditor();
    testClient = helper.createClient('atom');
    helper.putTestProjectInTestWorkspace(testClient, 'execute-apex');
    helper.setProject(testClient, 'execute-apex', function(err, proj) {
      project = proj;
      done();
    });
  });
  
  after(function(done) {
    helper.cleanUpTestProject('execute-apex')
      .then(function() {
        done();
      });
  });

  it('should execute anonymous apex', function(done) {
    this.timeout(10000);  

    testClient.executeCommand('execute-apex', { body: 'String foo = \'bar\';' }, function(err, response) {
      should.equal(err, null);
      response.should.have.property('result');
      response.result.compiled.should.equal(true);
      response.result.success.should.equal(true);
      done();
    });
  });

  it('should attempt to execute invalid anonymous apex', function(done) {
    this.timeout(10000);  

    testClient.executeCommand('execute-apex', { body: 'String foo = \'bar\'' }, function(err, response) {
      should.equal(err, null);
      response.should.have.property('result');
      response.result.compiled.should.equal(false);
      response.result.success.should.equal(false);
      response.result.compileProblem.should.equal('expecting a semi-colon, found \'<EOF>\'');
      done();
    });
  });
});
