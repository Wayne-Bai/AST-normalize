'use strict';

var helper      = require('../../test-helper');
var chai        = require('chai');
var should      = chai.should();
var path        = require('path');
var fs          = require('fs');

chai.use(require('chai-fs'));

describe('mavensmate delete-metadata', function(){

  var project;
  var testClient;

  before(function(done) {
    this.timeout(4000);
    testClient = helper.createClient('atom');
    helper.unlinkEditor();
    helper.putTestProjectInTestWorkspace(testClient, 'delete-metadata');
    helper.setProject(testClient, 'delete-metadata', function(err, proj) {
      project = proj;
      done();
    });
  });

  after(function(done) {
    helper.cleanUpTestProject('delete-metadata')
      .then(function() {
        done();
      });
  });

  it('should create then delete metadata from server', function(done) {
    
    this.timeout(100000);

    helper.createNewMetadata(testClient, 'ApexClass', 'DeleteMetadataClass')
      .then(function() {
        return helper.createNewMetadata(testClient, 'ApexClass', 'DeleteMetadataClass2');
      })
      .then(function() {
        var payload = {
          paths: [ 
            path.join(testClient.getProject().path, 'src', 'classes', 'DeleteMetadataClass.cls') ,
            path.join(testClient.getProject().path, 'src', 'classes', 'DeleteMetadataClass2.cls') 
          ]
        };

        testClient.executeCommand('delete-metadata', payload, function(err, response) {
          should.equal(err, null);
          response.should.have.property('result');
          response.result.success.should.equal(true);
          response.result.status.should.equal('Succeeded');
          response.result.numberComponentErrors.should.equal(0);
          response.result.numberComponentsDeployed.should.equal(2);
          fs.existsSync(path.join(testClient.getProject().path, 'src', 'classes', 'DeleteMetadataClass.cls')).should.equal(false);
          fs.existsSync(path.join(testClient.getProject().path, 'src', 'classes', 'DeleteMetadataClass2.cls')).should.equal(false);
          fs.existsSync(path.join(testClient.getProject().path, 'src', 'classes')).should.equal(false);
          done();
        });
      });    
  });

});
