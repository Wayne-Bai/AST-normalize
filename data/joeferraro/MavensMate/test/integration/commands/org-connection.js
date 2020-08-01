'use strict';

var helper      = require('../../test-helper');
var chai        = require('chai');
var should      = chai.should();
var path        = require('path');
var assert      = chai.assert;
var fs          = require('fs-extra');

chai.use(require('chai-fs'));

describe('mavensmate org-connections', function(){

  var project;
  var testClient;

  before(function(done) {
    this.timeout(4000);
    testClient = helper.createClient('atom');
    helper.unlinkEditor();
    helper.putTestProjectInTestWorkspace(testClient, 'org-connections');
    helper.setProject(testClient, 'org-connections', function(err, proj) {
      project = proj;
      done();
    });
  });

  after(function(done) {
    helper.cleanUpTestProject('org-connections')
      .then(function() {
        done();
      });
  });

  it('should add a new org connection', function(done) {
    this.timeout(10000);      
    
    var payload = {
      username: 'mm@force.com',
      password: 'force',
      orgType: 'developer'
    };
    testClient.executeCommand('new-connection', payload, function(err, response) {
      should.equal(err, null);
      response.should.have.property('result');
      response.result.should.equal('Org connection successfully created');
      assert.isFile(path.join(helper.baseTestDirectory(),'workspace', 'org-connections', 'config', '.org_connections'),  'Org Connections file not created');
      var connections = fs.readJsonSync(path.join(helper.baseTestDirectory(),'workspace', 'org-connections', 'config', '.org_connections'));
      connections.length.should.equal(1);
      done();
    });
    
  });

  it('should not add an org connection because of bad credentials', function(done) {
    this.timeout(10000);      
    
    var payload = {
      username: 'thiswontwork@force.com',
      password: 'cool!',
      orgType: 'developer'
    };
    testClient.executeCommand('new-connection', payload, function(err) {
      err.should.have.property('error');
      err.error.should.contain('INVALID_LOGIN: Invalid username, password, security token; or user locked out');
      assert.isFile(path.join(helper.baseTestDirectory(),'workspace', 'org-connections', 'config', '.org_connections'),  'Org Connections file not created');
      var connections = fs.readJsonSync(path.join(helper.baseTestDirectory(),'workspace', 'org-connections', 'config', '.org_connections'));
      connections.length.should.equal(1);
      done();
    });
    
  });

  it('should delete an org connection', function(done) {
    this.timeout(10000);      

    var connections = fs.readJsonSync(path.join(helper.baseTestDirectory(),'workspace', 'org-connections', 'config', '.org_connections'));
    
    var payload = {
      id: connections[0].id
    };
    testClient.executeCommand('delete-connection', payload, function(err, response) {
      should.equal(err, null);
      response.should.have.property('result');
      response.result.should.equal('Successfully deleted org connection');
      connections = fs.readJsonSync(path.join(helper.baseTestDirectory(),'workspace', 'org-connections', 'config', '.org_connections'));
      connections.length.should.equal(0);
      done();
    });    
  });

});
