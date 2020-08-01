'use strict';

var helper      = require('../../test-helper');
var chai        = require('chai');
var assert      = chai.assert;
var should      = chai.should();
var path        = require('path');
var fs          = require('fs-extra');

chai.use(require('chai-fs'));

describe('mavensmate apex-script', function() {

  var project;
  var testClient;
 
  before(function(done) {
    this.timeout(8000);
    helper.unlinkEditor();
    testClient = helper.createClient('atom');
    helper.putTestProjectInTestWorkspace(testClient, 'apex-script');
    helper.setProject(testClient, 'apex-script', function(err, proj) {
      project = proj;
      done();
    });
  });
  
  after(function(done) {
    helper.cleanUpTestProject('apex-script')
      .then(function() {
        done();
      });
  });

  it('should create a new apex script', function(done) {
    this.timeout(10000);  

    testClient.executeCommand('new-apex-script', { name: 'foo' }, function(err, response) {
      should.equal(err, null);
      response.should.have.property('result');
      response.result.should.equal('Apex script created successfully');
      assert.isDirectory(path.join(helper.baseTestDirectory(),'workspace', 'apex-script', 'apex-scripts'),  'Apex scripts directory does not exist');
      assert.isFile(path.join(helper.baseTestDirectory(),'workspace', 'apex-script', 'apex-scripts', 'foo.cls'),  'Script file does not exist');
      done();
    });
  });

  it('should execute an apex script that fails to compile', function(done) {
    this.timeout(10000);  

    var apexScriptPath = path.join(helper.baseTestDirectory(),'workspace', 'apex-script', 'apex-scripts', 'foo.cls');
    fs.outputFileSync(apexScriptPath, 'system.debug(\'hello!\'');

    testClient.executeCommand('run-apex-script', { paths: [ apexScriptPath ] }, function(err, response) {
      should.equal(err, null);
      response.should.have.property('result');
      response.result[apexScriptPath].success.should.equal(false);
      response.result[apexScriptPath].compileProblem.should.equal('expecting a right parentheses, found \'<EOF>\'');
      done();
    });
  });

  it('should execute an apex script that compiles successfully', function(done) {
    this.timeout(10000);  

    var apexScriptPath = path.join(helper.baseTestDirectory(),'workspace', 'apex-script', 'apex-scripts', 'foo.cls');
    fs.outputFileSync(apexScriptPath, 'system.debug(\'hello!\');');

    testClient.executeCommand('run-apex-script', { paths: [ apexScriptPath ] }, function(err, response) {
      should.equal(err, null);
      response.should.have.property('result');
      response.result[apexScriptPath].success.should.equal(true);
      should.equal(response.result[apexScriptPath].compileProblem, null);
      done();
    });
  });
});
